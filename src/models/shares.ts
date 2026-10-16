import type { UgreenNasClient } from "../client.ts";
import { NasResource } from "./base.ts";

export class SharedFolder extends NasResource<any> {
  get id(): number {
    return this.raw.id ?? 0;
  }

  get name(): string {
    return this.raw.name ?? "";
  }

  get path(): string {
    return this.raw.path ?? "";
  }

  get isMounted(): boolean {
    return Boolean(this.raw.is_mount ?? true);
  }

  get volume(): string {
    const parts = this.path.replace(/^\/+|\/+$/g, "").split("/");
    return parts[0] || "";
  }

  async getUsers(): Promise<any[]> {
    return this.client.shares.getShareUsers(this.id);
  }

  async setPermissions(permissions: any[]): Promise<any> {
    return this.client.shares.setSharePermissions(this.id, permissions);
  }
}

export abstract class FileService extends NasResource<any> {
  public serviceName: string;

  constructor(client: UgreenNasClient, serviceName: string) {
    super(client, {});
    this.serviceName = serviceName;
  }
}

export class SmbService extends FileService {
  constructor(client: UgreenNasClient) {
    super(client, "smb");
  }

  async getConfig(): Promise<any> {
    const cfg = await this.client.shares.getSmbConfig();
    this._refresh(cfg);
    return cfg;
  }

  async isEnabled(): Promise<boolean> {
    const cfg = await this.getConfig();
    return Boolean(cfg.status);
  }

  async getWorkgroup(): Promise<string> {
    const cfg = await this.getConfig();
    return cfg.work_group || "WORKGROUP";
  }

  async enable(): Promise<boolean> {
    await this.client.shares.setSmbEnabled(true);
    return true;
  }

  async disable(): Promise<boolean> {
    await this.client.shares.setSmbEnabled(false);
    return true;
  }
}

export class NfsService extends FileService {
  constructor(client: UgreenNasClient) {
    super(client, "nfs");
  }

  async getConfig(): Promise<any> {
    const cfg = await this.client.shares.getNfsConfig();
    this._refresh(cfg);
    return cfg;
  }

  async isEnabled(): Promise<boolean> {
    const cfg = await this.getConfig();
    return Boolean(cfg.enableNfsServer);
  }

  async enable(): Promise<boolean> {
    await this.client.shares.setNfsEnabled(true);
    return true;
  }

  async disable(): Promise<boolean> {
    await this.client.shares.setNfsEnabled(false);
    return true;
  }
}

export class FtpService extends FileService {
  constructor(client: UgreenNasClient) {
    super(client, "ftp");
  }

  async getConfig(): Promise<any> {
    const cfg = await this.client.shares.getFtpConfig();
    this._refresh(cfg);
    return cfg;
  }

  async enable(): Promise<boolean> {
    await this.client.shares.setFtpEnabled(true);
    return true;
  }

  async disable(): Promise<boolean> {
    await this.client.shares.setFtpEnabled(false);
    return true;
  }
}

export class WebdavService extends FileService {
  constructor(client: UgreenNasClient) {
    super(client, "webdav");
  }

  async getConfig(): Promise<any> {
    const cfg = await this.client.shares.getWebdavConfig();
    this._refresh(cfg);
    return cfg;
  }

  async enable(): Promise<boolean> {
    await this.client.shares.setWebdavEnabled(true);
    return true;
  }

  async disable(): Promise<boolean> {
    await this.client.shares.setWebdavEnabled(false);
    return true;
  }
}

export class RsyncService extends FileService {
  constructor(client: UgreenNasClient) {
    super(client, "rsync");
  }

  async getConfig(): Promise<any> {
    const cfg = await this.client.shares.getRsyncConfig();
    this._refresh(cfg);
    return cfg;
  }

  async enable(): Promise<boolean> {
    await this.client.shares.setRsyncEnabled(true);
    return true;
  }

  async disable(): Promise<boolean> {
    await this.client.shares.setRsyncEnabled(false);
    return true;
  }
}
