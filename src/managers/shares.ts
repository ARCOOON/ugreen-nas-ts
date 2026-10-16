import type { UgreenNasClient } from "../client.ts";
import { SharedFolder } from "../models/shares.ts";

export class ShareManager {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all shared network folders. */
  async all(): Promise<SharedFolder[]> {
    const res = await this.client.request<{ result: any[] }>("GET", "/ugreen/v1/filemgr/getShareList");
    const list = res.data?.result || [];
    return list.map((item) => new SharedFolder(this.client, item));
  }

  /** Find a shared folder by ID or name. */
  async get(idOrName: number | string): Promise<SharedFolder | undefined> {
    const shares = await this.all();
    return shares.find((s) => {
      if (typeof idOrName === "number") return s.id === idOrName;
      return s.name === idOrName || String(s.id) === idOrName;
    });
  }

  /** List user permissions for a share. */
  async getShareUsers(shareId: number): Promise<any[]> {
    const res = await this.client.request<{ result: any[] }>(
      "GET",
      `/ugreen/v1/filemgr/shareUserList?id=${shareId}`
    );
    return res.data?.result || [];
  }

  /** Set user/group permissions for a share. */
  async setSharePermissions(shareId: number, permissions: any[]): Promise<any> {
    return this.client.request("POST", "/ugreen/v1/filemgr/sharePermission", {
      body: { id: shareId, permissions },
    });
  }

  // Raw file service helper endpoints
  async getSmbConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/smb/config");
    return res.data;
  }

  async setSmbEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/smb/start" : "/ugreen/v1/file/smb/stop");
  }

  async getNfsConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/nfs/config");
    return res.data;
  }

  async setNfsEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/nfs/start" : "/ugreen/v1/file/nfs/stop");
  }

  async getFtpConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/ftp/config");
    return res.data;
  }

  async setFtpEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/ftp/start" : "/ugreen/v1/file/ftp/stop");
  }

  async getWebdavConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/webdav/config");
    return res.data;
  }

  async setWebdavEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/webdav/start" : "/ugreen/v1/file/webdav/stop");
  }

  async getRsyncConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/rsync/config");
    return res.data;
  }

  async setRsyncEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/rsync/start" : "/ugreen/v1/file/rsync/stop");
  }
}
