import type { UgreenNasClient } from "../client.ts";
import { rsaEncryptPkcs1 } from "../crypto.ts";
import { Group, User, UserSession } from "../models/users.ts";

export class UserManager {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all local NAS users as rich User objects. */
  async all(reverse = false): Promise<User[]> {
    const res = await this.client.request<{ list: any[] }>("GET", `/ugreen/v1/user/list?reverse=${reverse}`);
    const list = res.data?.list || [];
    return list.map((item) => new User(this.client, item));
  }

  /** Get user details by UID. */
  async get(uid: number): Promise<User | undefined> {
    try {
      const res = await this.client.request<any>("GET", `/ugreen/v1/user/uid/${uid}`);
      return res.data ? new User(this.client, res.data) : undefined;
    } catch {
      return undefined;
    }
  }

  /** Find user by username. */
  async getByName(username: string): Promise<User | undefined> {
    const users = await this.all();
    return users.find((u) => u.username === username);
  }

  /** Get profile of the currently logged-in user. */
  async current(): Promise<User> {
    const res = await this.client.request<any>("GET", "/ugreen/v1/user/current/user");
    return new User(this.client, res.data);
  }

  /** Create a new local user on the NAS. */
  async create(options: {
    username: string;
    password: string;
    role?: string;
    groups?: number[];
    email?: string;
    phone?: string;
    description?: string;
    dirQuota?: number;
  }): Promise<User> {
    const payload = {
      username: options.username,
      password: options.password,
      role: options.role || "users",
      groups: options.groups || [100],
      email: options.email || "",
      phone: options.phone || "",
      description: options.description || "",
      dir_quota: options.dirQuota || 0,
      expire_time: -1,
      enable_home_dir: true,
    };
    await this.client.request("POST", "/ugreen/v1/user/create", { body: payload });
    const user = await this.getByName(options.username);
    if (user) return user;
    return new User(this.client, { username: options.username, role: options.role || "users" });
  }

  /** Update an existing user. */
  async edit(
    uid: number,
    options: {
      role?: string;
      groups?: Array<number | { gid: number; name?: string }>;
      email?: string;
      phone?: string;
      description?: string;
      dirQuota?: number;
      dir_quota?: number;
    }
  ): Promise<any> {
    const user = await this.get(uid);
    const raw = user?.raw || {};
    const payload = {
      uid,
      username: raw.username,
      role: options.role ?? raw.role ?? "users",
      groups: options.groups ? options.groups.map((g: any) => g.gid ?? g) : raw.groups?.map((g: any) => g.gid) || [100],
      email: options.email ?? raw.email ?? "",
      phone: options.phone ?? raw.phone ?? "",
      description: options.description ?? raw.description ?? "",
      dir_quota: options.dirQuota ?? options.dir_quota ?? raw.dir_quota ?? 0,
    };
    return this.client.request("POST", "/ugreen/v1/user/edit", { body: payload });
  }

  /** Delete users by UID. Requires current admin password. */
  async delete(uids: number | number[], adminPassword: string): Promise<boolean> {
    const uidList = Array.isArray(uids) ? uids : [uids];
    const curr = await this.current();
    const adminUser = curr.username || this.client.currentLogin?.username;
    if (!adminUser) throw new Error("Could not determine current admin username for confirmation.");

    const rsaToken = await this.client.getPublicKey(adminUser);
    const encryptedPw = rsaEncryptPkcs1(adminPassword, rsaToken);

    const res = await this.client.request("DELETE", "/ugreen/v1/user/delete", {
      body: { uids: uidList },
      headers: { "X-CurPass-Token": encryptedPw },
    });
    return res.code === 200;
  }

  /** List active user sessions. */
  async sessions(pageNum = 1, pageSize = 50): Promise<UserSession[]> {
    const res = await this.client.request<{ list: any[] }>("POST", "/ugreen/v1/user/online/list", {
      body: { page_num: pageNum, page_size: pageSize },
    });
    const list = res.data?.list || [];
    return list.map((item) => new UserSession(this.client, item));
  }

  /** Disconnect an active user session. */
  async terminateSession(sessionId: number | string): Promise<boolean> {
    const res = await this.client.request("POST", "/ugreen/v1/user/online/stop", {
      body: { id: Number(sessionId) },
    });
    return res.code === 200;
  }
}

export class GroupManager {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List user groups. */
  async all(reverse = false): Promise<Group[]> {
    const res = await this.client.request<{ list: any[] }>("GET", `/ugreen/v1/group/list?reverse=${reverse}`);
    const list = res.data?.list || [];
    return list.map((item) => new Group(this.client, item));
  }

  /** Get group info by GID. */
  async get(gid: number): Promise<Group | undefined> {
    try {
      const res = await this.client.request<any>("GET", `/ugreen/v1/group/info/${gid}`);
      return res.data ? new Group(this.client, res.data) : undefined;
    } catch {
      return undefined;
    }
  }

  /** Find group by name. */
  async getByName(name: string): Promise<Group | undefined> {
    const groups = await this.all();
    return groups.find((g) => g.name === name);
  }

  /** Create user group. */
  async create(name: string, description = "", members: number[] = []): Promise<Group> {
    await this.client.request("POST", "/ugreen/v1/group/create", {
      body: { name, description, members },
    });
    const grp = await this.getByName(name);
    if (grp) return grp;
    return new Group(this.client, { name, description, members });
  }

  /** Edit user group. */
  async edit(gid: number, options: { name?: string; description?: string; members?: number[] }): Promise<any> {
    const current = await this.get(gid);
    const payload = {
      gid,
      name: options.name || current?.name,
      description: options.description ?? current?.description,
      members: options.members ?? current?.members,
    };
    return this.client.request("POST", "/ugreen/v1/group/edit", { body: payload });
  }

  /** Delete user group. */
  async delete(gid: number): Promise<boolean> {
    const res = await this.client.request("DELETE", "/ugreen/v1/group/delete", { body: { gid } });
    return res.code === 200;
  }
}
