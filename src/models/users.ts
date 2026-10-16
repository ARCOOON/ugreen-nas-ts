import { NasResource } from "./base.ts";

export class User extends NasResource<any> {
  get uid(): number {
    return this.raw.uid ?? 0;
  }

  get username(): string {
    return this.raw.username ?? "";
  }

  get role(): string {
    return this.raw.role ?? "users";
  }

  get isAdmin(): boolean {
    return this.role === "admin";
  }

  get email(): string {
    return this.raw.email ?? "";
  }

  get phone(): string {
    return this.raw.phone ?? "";
  }

  get description(): string {
    return this.raw.description ?? "";
  }

  get dirQuotaBytes(): number {
    return this.raw.dir_quota ?? 0;
  }

  get groups(): Array<{ gid: number; name: string }> {
    return this.raw.groups ?? [];
  }

  async edit(options: {
    role?: string;
    groups?: number[];
    email?: string;
    phone?: string;
    description?: string;
    dirQuota?: number;
  }): Promise<User> {
    await this.client.users.edit(this.uid, options);
    const updated = await this.client.users.get(this.uid);
    if (updated) {
      this._refresh(updated.raw);
    }
    return this;
  }

  async delete(adminPassword: string): Promise<boolean> {
    return this.client.users.delete(this.uid, adminPassword);
  }
}

export class Group extends NasResource<any> {
  get gid(): number {
    return this.raw.gid ?? 0;
  }

  get name(): string {
    return this.raw.name ?? "";
  }

  get description(): string {
    return this.raw.description ?? "";
  }

  get members(): number[] {
    return this.raw.members ?? [];
  }

  async edit(options: {
    name?: string;
    description?: string;
    members?: number[];
  }): Promise<Group> {
    await this.client.groups.edit(this.gid, options);
    const updated = await this.client.groups.get(this.gid);
    if (updated) {
      this._refresh(updated.raw);
    }
    return this;
  }

  async delete(): Promise<boolean> {
    return this.client.groups.delete(this.gid);
  }
}

export class UserSession extends NasResource<any> {
  get sessionId(): number {
    return this.raw.id ?? 0;
  }

  get uid(): number {
    return this.raw.uid ?? 0;
  }

  get username(): string {
    return this.raw.username ?? "";
  }

  get clientIp(): string {
    return this.raw.ip ?? "";
  }

  get host(): string {
    return this.raw.host ?? "";
  }

  get loginTime(): number {
    return this.raw.login_time ?? 0;
  }

  get isCurrentConnection(): boolean {
    return Boolean(this.raw.is_current_connection);
  }

  get connectionDurationSeconds(): number {
    return this.raw.connection_duration ?? 0;
  }

  async terminate(): Promise<boolean> {
    return this.client.users.terminateSession(this.sessionId);
  }
}
