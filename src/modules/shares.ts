import type { UgreenNasClient } from "../client.ts";
import type { NfsConfig, SharedFolder, SmbConfig } from "../types.ts";

export class SharesModule {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all shared network folders. */
  async listShares(): Promise<SharedFolder[]> {
    const res = await this.client.request<{ result: SharedFolder[] }>("GET", "/ugreen/v1/filemgr/getShareList");
    return res.data?.result || [];
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

  // SMB
  async getSmbConfig(): Promise<SmbConfig> {
    const res = await this.client.request<SmbConfig>("GET", "/ugreen/v1/file/smb/config");
    return res.data;
  }

  async setSmbEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/smb/start" : "/ugreen/v1/file/smb/stop");
  }

  // NFS
  async getNfsConfig(): Promise<NfsConfig> {
    const res = await this.client.request<NfsConfig>("GET", "/ugreen/v1/file/nfs/config");
    return res.data;
  }

  async setNfsEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/nfs/start" : "/ugreen/v1/file/nfs/stop");
  }

  // FTP
  async getFtpConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/ftp/config");
    return res.data;
  }

  async setFtpEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/ftp/start" : "/ugreen/v1/file/ftp/stop");
  }

  // WebDAV
  async getWebdavConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/webdav/config");
    return res.data;
  }

  async setWebdavEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/webdav/start" : "/ugreen/v1/file/webdav/stop");
  }

  // Rsync
  async getRsyncConfig(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/file/rsync/config");
    return res.data;
  }

  async setRsyncEnabled(enabled: boolean): Promise<any> {
    return this.client.request("POST", enabled ? "/ugreen/v1/file/rsync/start" : "/ugreen/v1/file/rsync/stop");
  }
}
