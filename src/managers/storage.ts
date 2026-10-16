import type { UgreenNasClient } from "../client.ts";
import { Disk, StoragePool, Volume } from "../models/storage.ts";

export class DiskManager {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all physical storage drives. */
  async all(): Promise<Disk[]> {
    const res = await this.client.request<{ result: any[] }>("GET", "/ugreen/v2/storage/disk/list");
    const list = res.data?.result || [];
    return list.map((item) => new Disk(this.client, item));
  }

  /** Find a drive by dev name (e.g. 'sda') or slot (e.g. 'ata1'). */
  async get(slotOrName: string): Promise<Disk | undefined> {
    const disks = await this.all();
    return disks.find((d) => d.name === slotOrName || d.slot === slotOrName || d.devName === slotOrName);
  }
}

export class StoragePoolManager {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all RAID storage pools. */
  async all(): Promise<StoragePool[]> {
    const res = await this.client.request<{ result: any[] }>("GET", "/ugreen/v1/storage/pool/list");
    const list = res.data?.result || [];
    return list.map((item) => new StoragePool(this.client, item));
  }

  /** Find a storage pool by name or label. */
  async get(nameOrLabel: string): Promise<StoragePool | undefined> {
    const pools = await this.all();
    return pools.find((p) => p.name === nameOrLabel || p.label === nameOrLabel);
  }
}

export class VolumeManager {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all logical volumes. */
  async all(): Promise<Volume[]> {
    const res = await this.client.request<{ result: any[] }>("GET", "/ugreen/v1/storage/volume/list");
    const list = res.data?.result || [];
    return list.map((item) => new Volume(this.client, item));
  }

  /** Find a volume by name (e.g. 'dm-0') or UUID. */
  async get(nameOrUuid: string): Promise<Volume | undefined> {
    const volumes = await this.all();
    return volumes.find((v) => v.name === nameOrUuid || v.uuid === nameOrUuid || v.label === nameOrUuid);
  }
}

export class StorageManager {
  private client: UgreenNasClient;
  public disks: DiskManager;
  public pools: StoragePoolManager;
  public volumes: VolumeManager;

  constructor(client: UgreenNasClient) {
    this.client = client;
    this.disks = new DiskManager(client);
    this.pools = new StoragePoolManager(client);
    this.volumes = new VolumeManager(client);
  }

  /** Get S.M.A.R.T. health test results and attributes for a drive (e.g. 'sda'). */
  async getDiskSmartInfo(diskName: string): Promise<any> {
    const res = await this.client.request("GET", `/ugreen/v1/storage/disk/smart/info?disk=${diskName}`);
    return res.data;
  }

  /** Get available free space in bytes for a volume path. */
  async getPathFreeSize(path: string): Promise<number> {
    const res = await this.client.request<{ free: number }>("POST", "/ugreen/v1/filemgr/getPathFreeSize", {
      body: { path },
    });
    return res.data?.free || 0;
  }

  /** Get summarized volume allocations. */
  async getVolumesSummary(): Promise<any[]> {
    const res = await this.client.request<{ result: any[] }>("GET", "/ugreen/v1/filemgr/getVolumes");
    return res.data?.result || [];
  }
}
