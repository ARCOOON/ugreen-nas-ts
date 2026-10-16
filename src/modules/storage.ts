import type { UgreenNasClient } from "../client.ts";
import type { NasDisk, NasVolume, StoragePool } from "../types.ts";

export class StorageModule {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all physical disks, interfaces, temperatures, and health metrics. */
  async listDisks(): Promise<NasDisk[]> {
    const res = await this.client.request<{ result: NasDisk[] }>("GET", "/ugreen/v2/storage/disk/list");
    return res.data?.result || [];
  }

  /** Get S.M.A.R.T. health info for a disk by device name (e.g. 'sda'). */
  async getDiskSmartInfo(diskName: string): Promise<any> {
    const res = await this.client.request("GET", `/ugreen/v1/storage/disk/smart/info?disk=${diskName}`);
    return res.data;
  }

  /** List RAID storage pools and sync status. */
  async listStoragePools(): Promise<StoragePool[]> {
    const res = await this.client.request<{ result: StoragePool[] }>("GET", "/ugreen/v1/storage/pool/list");
    return res.data?.result || [];
  }

  /** List logical volumes, total capacity, and used space. */
  async listVolumes(): Promise<NasVolume[]> {
    const res = await this.client.request<{ result: NasVolume[] }>("GET", "/ugreen/v1/storage/volume/list");
    return res.data?.result || [];
  }

  /** Get volumes summary. */
  async getVolumesSummary(): Promise<any[]> {
    const res = await this.client.request<{ result: any[] }>("GET", "/ugreen/v1/filemgr/getVolumes");
    return res.data?.result || [];
  }

  /** Get available free space in bytes for a volume path. */
  async getPathFreeSize(path: string): Promise<number> {
    const res = await this.client.request<{ free: number }>("POST", "/ugreen/v1/filemgr/getPathFreeSize", {
      body: { path },
    });
    return res.data?.free || 0;
  }
}
