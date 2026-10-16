import { NasResource } from "./base.ts";

export class Disk extends NasResource<any> {
  get name(): string {
    return this.raw.name ?? "";
  }

  get devName(): string {
    return this.raw.dev_name ?? "";
  }

  get model(): string {
    return this.raw.model ?? "";
  }

  get serial(): string {
    return this.raw.serial ?? "";
  }

  get sizeBytes(): number {
    return this.raw.size ?? 0;
  }

  get sizeGb(): number {
    return Number((this.sizeBytes / 1024 ** 3).toFixed(2));
  }

  get sizeTb(): number {
    return Number((this.sizeBytes / 1024 ** 4).toFixed(2));
  }

  get slot(): string {
    return this.raw.slot ?? "";
  }

  get interfaceType(): string {
    return this.raw.interface_type ?? "";
  }

  get temperature(): number | undefined {
    return this.raw.temperature;
  }

  get healthStatus(): number {
    return this.raw.health ?? 0;
  }

  get isHealthy(): boolean {
    return this.healthStatus === 0 || this.raw.status === 1;
  }

  async getSmartInfo(): Promise<any> {
    try {
      return await this.client.storage.getDiskSmartInfo(this.name);
    } catch {
      return {
        health: this.healthStatus,
        temperature: this.temperature,
        power_on_hours: this.raw.power_on_hours,
        is_support_smart: this.raw.is_support_smart ?? true,
        brand: this.raw.brand,
        model: this.model,
        serial: this.serial,
      };
    }
  }
}

export class StoragePool extends NasResource<any> {
  get name(): string {
    return this.raw.name ?? "";
  }

  get label(): string {
    return this.raw.label ?? "";
  }

  get raidLevel(): string {
    return this.raw.level ?? "";
  }

  get status(): number {
    return this.raw.status ?? 0;
  }

  get isHealthy(): boolean {
    return this.status === 0;
  }

  get isSyncing(): boolean {
    return Number(this.raw.sys_sync_progress ?? 0) > 0;
  }

  get syncProgressPercent(): number {
    return Number(this.raw.sys_sync_progress ?? 0);
  }

  get totalBytes(): number {
    return this.raw.total ?? 0;
  }

  get totalGb(): number {
    return Number((this.totalBytes / 1024 ** 3).toFixed(2));
  }

  get totalTb(): number {
    return Number((this.totalBytes / 1024 ** 4).toFixed(2));
  }
}

export class Volume extends NasResource<any> {
  get name(): string {
    return this.raw.name ?? "";
  }

  get label(): string {
    return this.raw.label ?? "";
  }

  get filesystem(): string {
    return this.raw.filesystem ?? "";
  }

  get uuid(): string {
    return this.raw.uuid ?? "";
  }

  get device(): string {
    return this.raw.device ?? "";
  }

  get totalBytes(): number {
    return this.raw.total ?? 0;
  }

  get usedBytes(): number {
    return this.raw.used ?? 0;
  }

  get freeBytes(): number {
    return Math.max(0, this.totalBytes - this.usedBytes);
  }

  get totalGb(): number {
    return Number((this.totalBytes / 1024 ** 3).toFixed(2));
  }

  get usedGb(): number {
    return Number((this.usedBytes / 1024 ** 3).toFixed(2));
  }

  get freeGb(): number {
    return Number((this.freeBytes / 1024 ** 3).toFixed(2));
  }

  get totalTb(): number {
    return Number((this.totalBytes / 1024 ** 4).toFixed(2));
  }

  get usedTb(): number {
    return Number((this.usedBytes / 1024 ** 4).toFixed(2));
  }

  get usagePercent(): number {
    if (this.totalBytes === 0) return 0;
    return Number(((this.usedBytes / this.totalBytes) * 100).toFixed(1));
  }

  get isHealthy(): boolean {
    return (this.raw.health ?? 0) === 0;
  }

  async getPathFreeSize(subpath = ""): Promise<number> {
    const cleanSub = subpath.replace(/^\/+|\/+$/g, "");
    const targetPath = cleanSub ? `/${this.name}/${cleanSub}` : `/${this.name}`;
    return this.client.storage.getPathFreeSize(targetPath);
  }
}
