import type { UgreenNasClient } from "../client.ts";
import { rsaEncryptPkcs1 } from "../crypto.ts";
import type { NasGroup, NasUser } from "../types.ts";

export class UsersModule {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all local NAS users. */
  async listUsers(reverse = false): Promise<NasUser[]> {
    const res = await this.client.request<{ list: NasUser[] }>("GET", `/ugreen/v1/user/list?reverse=${reverse}`);
    return res.data?.list || [];
  }

  /** Get user details by UID. */
  async getUser(uid: number): Promise<NasUser> {
    const res = await this.client.request<NasUser>("GET", `/ugreen/v1/user/uid/${uid}`);
    return res.data;
  }

  /** Get profile of the currently logged-in user. */
  async getCurrentUser(): Promise<NasUser> {
    const res = await this.client.request<NasUser>("GET", "/ugreen/v1/user/current/user");
    return res.data;
  }

  /** List currently active user sessions. */
  async listOnlineSessions(): Promise<any[]> {
    const res = await this.client.request<{ list: any[] }>("GET", "/ugreen/v1/user/online/list");
    return res.data?.list || [];
  }

  /** Disconnect an active user session. */
  async terminateSession(sessionId: string): Promise<any> {
    return this.client.request("POST", "/ugreen/v1/user/online/stop", { body: { id: sessionId } });
  }

  /** Create a new local user. */
  async createUser(options: {
    username: string;
    password: string;
    role?: string;
    groups?: number[];
    email?: string;
    phone?: string;
    description?: string;
    dirQuota?: number;
  }): Promise<any> {
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
    return this.client.request("POST", "/ugreen/v1/user/create", { body: payload });
  }

  /** Update an existing user. */
  async editUser(uid: number, options: Partial<NasUser>): Promise<any> {
    const user = await this.getUser(uid);
    const payload = {
      uid,
      username: user.username,
      role: options.role ?? user.role ?? "users",
      groups: options.groups ? options.groups.map((g: any) => g.gid ?? g) : user.groups?.map((g) => g.gid) || [100],
      email: options.email ?? user.email ?? "",
      phone: options.phone ?? user.phone ?? "",
      description: options.description ?? user.description ?? "",
      dir_quota: options.dir_quota ?? user.dir_quota ?? 0,
    };
    return this.client.request("POST", "/ugreen/v1/user/edit", { body: payload });
  }

  /** Delete users by UID. Requires current admin password. */
  async deleteUsers(uids: number[], adminPassword: string): Promise<any> {
    const curr = await this.getCurrentUser();
    const adminUser = curr?.username || this.client.currentLogin?.username;
    if (!adminUser) throw new Error("Could not determine current admin username for confirmation.");

    const rsaToken = await this.client.getPublicKey(adminUser);
    const encryptedPw = rsaEncryptPkcs1(adminPassword, rsaToken);

    return this.client.request("DELETE", "/ugreen/v1/user/delete", {
      body: { uids },
      headers: { "X-CurPass-Token": encryptedPw },
    });
  }

  /** List user groups. */
  async listGroups(reverse = false): Promise<NasGroup[]> {
    const res = await this.client.request<{ list: NasGroup[] }>("GET", `/ugreen/v1/group/list?reverse=${reverse}`);
    return res.data?.list || [];
  }

  /** Get group info by GID. */
  async getGroup(gid: number): Promise<NasGroup> {
    const res = await this.client.request<NasGroup>("GET", `/ugreen/v1/group/info/${gid}`);
    return res.data;
  }

  /** Create user group. */
  async createGroup(name: string, description = "", members: number[] = []): Promise<any> {
    return this.client.request("POST", "/ugreen/v1/group/create", { body: { name, description, members } });
  }

  /** Delete user group. */
  async deleteGroup(gid: number): Promise<any> {
    return this.client.request("DELETE", "/ugreen/v1/group/delete", { body: { gid } });
  }
}
