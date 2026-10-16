import * as http from "http";
import * as https from "https";
import { URL } from "url";
import { rsaEncryptPkcs1 } from "./crypto.ts";
import {
  GroupManager,
  NetworkManager,
  PowerManager,
  ServicesManager,
  ShareManager,
  StorageManager,
  UserManager,
} from "./managers/index.ts";
import type { ApiResponse, LoginResult, UgreenNasConfig } from "./types.ts";

const UGREENLINK_LOOKUP_URL = "https://api.ugnas.com/api/p2p/v2/ta/nodeInfo/byAlias";

export class UgreenNasClient {
  public baseUrl: string = "";
  public token?: string;
  public tokenId?: string;
  public sessionPublicKey?: string;
  public currentLogin?: LoginResult;

  public users: UserManager;
  public groups: GroupManager;
  public network: NetworkManager;
  public storage: StorageManager;
  public shares: ShareManager;
  public services: ServicesManager;
  public power: PowerManager;

  public readonly config: UgreenNasConfig;
  private fetchImpl: typeof globalThis.fetch;
  private initPromise?: Promise<void>;

  constructor(config: UgreenNasConfig) {
    this.config = config;
    this.fetchImpl = config.fetch || createDefaultFetch();

    if (config.baseUrl) {
      this.baseUrl = this.normalizeUrl(config.baseUrl);
    } else if (config.uglinkId) {
      this.initPromise = UgreenNasClient.resolveUgreenLinkUrl(config.uglinkId, this.fetchImpl).then((url) => {
        this.baseUrl = url;
      });
    } else {
      throw new Error("Either baseUrl or uglinkId must be configured.");
    }

    this.users = new UserManager(this);
    this.groups = new GroupManager(this);
    this.network = new NetworkManager(this);
    this.storage = new StorageManager(this);
    this.shares = new ShareManager(this);
    this.services = new ServicesManager(this);
    this.power = new PowerManager(this);
  }

  /** Resolves a UGREENlink ID (e.g. 'my-nas-alias') to the HTTPS relay URL. */
  static async resolveUgreenLinkUrl(
    uglinkId: string,
    fetchImpl: typeof globalThis.fetch = createDefaultFetch()
  ): Promise<string> {
    let alias = uglinkId.trim();
    if (alias.includes("://")) {
      const url = new URL(alias);
      const parts = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
      if (parts[0]) alias = parts[0];
      else if (url.hostname) alias = url.hostname.split(".")[0];
    }

    const res = await fetchImpl(UGREENLINK_LOOKUP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ alias }),
    });

    if (!res.ok) {
      throw new Error(`UGREENlink service error: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as ApiResponse<{ relayDomain: string }>;
    if (body.code !== 200 || !body.data?.relayDomain) {
      throw new Error(`UGREENlink lookup failed for '${alias}': ${body.msg || body.code}`);
    }

    return `https://${alias}.${body.data.relayDomain}`;
  }

  private normalizeUrl(url: string): string {
    const trimmed = url.trim();
    const withProto = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    return withProto.replace(/\/+$/, "");
  }

  private async ensureBaseUrl(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.baseUrl) {
      throw new Error("Client baseUrl is not initialized.");
    }
  }

  /** Fetches the RSA public key token from the NAS. */
  async getPublicKey(username: string): Promise<string> {
    await this.ensureBaseUrl();
    const res = await this.fetchImpl(`${this.baseUrl}/ugreen/v1/verify/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      throw new Error(`verify/check failed: ${res.status}`);
    }

    const rsaToken = res.headers.get("x-rsa-token") || res.headers.get("X-Rsa-Token");
    if (!rsaToken) {
      throw new Error("Response headers missing X-Rsa-Token");
    }
    return rsaToken;
  }

  /** Logs into the NAS with username and password. */
  async login(username: string, password: string, keepalive = true): Promise<LoginResult> {
    await this.ensureBaseUrl();
    const rsaToken = await this.getPublicKey(username);
    const encryptedPassword = rsaEncryptPkcs1(password, rsaToken);

    const payload = {
      username,
      password: encryptedPassword,
      otp: true,
      keepalive,
      is_simple: true,
    };

    const res = await this.request<LoginResult>("POST", "/ugreen/v1/verify/login", {
      body: payload,
      authenticated: false,
    });

    this.token = res.data.token;
    this.tokenId = res.data.token_id;
    this.sessionPublicKey = res.data.public_key;
    this.currentLogin = res.data;
    return res.data;
  }

  /** Checks if session is active. */
  async isLoggedIn(): Promise<boolean> {
    try {
      const res = await this.request("GET", "/ugreen/v1/verify/is_login");
      return res.code === 200;
    } catch {
      return false;
    }
  }

  /** Send keepalive heartbeat. */
  async heartbeat(): Promise<any> {
    return this.request("GET", "/ugreen/v1/verify/heartbeat");
  }

  /** Get common system info. */
  async getSystemInfo(): Promise<any> {
    const res = await this.request("GET", "/ugreen/v1/sysinfo/machine/common");
    return res.data;
  }

  /** Core HTTP request dispatcher. */
  async request<T = any>(
    method: string,
    path: string,
    options: {
      params?: Record<string, string | number | boolean>;
      body?: any;
      headers?: Record<string, string>;
      authenticated?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    await this.ensureBaseUrl();
    const { params = {}, body, headers = {}, authenticated = true } = options;

    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "UgreenNasSdk-TS/1.0",
      ...headers,
    };

    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      searchParams.set(k, String(v));
    }

    if (authenticated) {
      if (!this.token) {
        throw new Error("Not logged in. Call login() first.");
      }
      searchParams.set("token", this.token);
      reqHeaders["X-Ugreen-Token"] = this.token;

      if (this.tokenId && this.sessionPublicKey) {
        try {
          const encToken = rsaEncryptPkcs1(this.token, this.sessionPublicKey);
          reqHeaders["x-ugreen-security-key"] = this.tokenId;
          reqHeaders["x-ugreen-token"] = encToken;
        } catch {}
      }
    }

    const query = searchParams.toString();
    const url = `${this.baseUrl}/${path.replace(/^\/+/, "")}${query ? `?${query}` : ""}`;

    const res = await this.fetchImpl(url, {
      method,
      headers: reqHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json: ApiResponse<T>;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }

    if (json.code !== 200) {
      throw new Error(`UGOS API error [${json.code}]: ${json.msg || "Operation failed"}`);
    }

    return json;
  }
}

/** Creates a fetch function that routes through HTTP/HTTPS proxy if configured in environment. */
function createDefaultFetch(): typeof globalThis.fetch {
  const proxyUrl = process.env?.https_proxy || process.env?.http_proxy || process.env?.HTTPS_PROXY || process.env?.HTTP_PROXY;
  if (!proxyUrl || typeof window !== "undefined") {
    return globalThis.fetch.bind(globalThis);
  }

  // Node.js proxy-aware fetch
  return function proxyFetch(input: any, init: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const targetUrl = typeof input === "string" ? input : input.url || input.href;
      const parsed = new URL(targetUrl);
      const proxy = new URL(proxyUrl);
      const isHttps = parsed.protocol === "https:";

      const connectReq = http.request({
        host: proxy.hostname,
        port: proxy.port || 80,
        method: "CONNECT",
        path: `${parsed.hostname}:${parsed.port || (isHttps ? 443 : 80)}`,
      });

      connectReq.on("connect", (res, socket) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Proxy CONNECT tunnel failed with status ${res.statusCode}`));
        }

        const transport = isHttps ? https : http;
        const req = transport.request(
          {
            host: parsed.hostname,
            port: parsed.port || (isHttps ? 443 : 80),
            path: `${parsed.pathname}${parsed.search}`,
            method: init.method || "GET",
            headers: init.headers || {},
            socket: socket,
            agent: false,
          } as http.RequestOptions,
          (resp) => {
            let data = "";
            resp.on("data", (c) => (data += c));
            resp.on("end", () => {
              const headersMap: Record<string, string> = {};
              for (const [k, v] of Object.entries(resp.headers)) {
                if (v !== undefined) headersMap[k.toLowerCase()] = Array.isArray(v) ? v.join(", ") : v;
              }
              resolve({
                ok: (resp.statusCode || 0) >= 200 && (resp.statusCode || 0) < 300,
                status: resp.statusCode,
                statusText: resp.statusMessage || "",
                headers: {
                  get: (name: string) => headersMap[name.toLowerCase()] || null,
                },
                text: () => Promise.resolve(data),
                json: () => Promise.resolve(JSON.parse(data)),
              });
            });
          }
        );

        req.on("error", reject);
        if (init.body) req.write(init.body);
        req.end();
      });

      connectReq.on("error", reject);
      connectReq.end();
    });
  };
}
