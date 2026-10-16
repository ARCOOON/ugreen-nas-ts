import type { UgreenNasClient } from "../client.ts";
import { FanMode } from "../enums.ts";
import { NasResource } from "./base.ts";

export class FanControl extends NasResource<any> {
  constructor(client: UgreenNasClient) {
    super(client, {});
  }

  async getConfig(): Promise<any> {
    const cfg = await this.client.power.getFanConfig();
    this._refresh(cfg);
    return cfg;
  }

  async getMode(): Promise<FanMode> {
    const cfg = await this.getConfig();
    return (cfg.mode as FanMode) || FanMode.Standard;
  }

  async setMode(mode: FanMode | 1 | 2 | 3): Promise<boolean> {
    await this.client.power.setFanMode(mode as any);
    return true;
  }
}

export class PowerSettings extends NasResource<any> {
  get wakeOnLan(): boolean {
    return Boolean(this.raw.wake_on);
  }

  get powerBootOnAc(): boolean {
    return Boolean(this.raw.power_boot);
  }

  get hddSleepMinutes(): number {
    return this.raw.hard_drive_flag ? (this.raw.hard_drive_time ?? 20) : 0;
  }

  get scheduledPowerEnabled(): boolean {
    return Boolean(this.raw.enable_scheduled_power);
  }

  get timeSwitches(): any[] {
    return this.raw.time_switches ?? [];
  }

  async update(options: {
    wakeOnLan?: boolean;
    powerBootOnAc?: boolean;
    hddSleepMinutes?: number;
    scheduledPowerEnabled?: boolean;
  }): Promise<PowerSettings> {
    await this.client.power.setPowerConfig({
      wakeOnLan: options.wakeOnLan,
      powerBootOnAc: options.powerBootOnAc,
      hardDriveSleepMinutes: options.hddSleepMinutes,
      enableScheduledPower: options.scheduledPowerEnabled,
    });
    const updated = await this.client.power.getSettings();
    this._refresh(updated.raw);
    return this;
  }
}

export class SshTerminal extends NasResource<any> {
  constructor(client: UgreenNasClient) {
    super(client, {});
  }

  async getConfig(): Promise<any> {
    const cfg = await this.client.power.getTerminalConfig();
    this._refresh(cfg);
    return cfg.SshConfig || {};
  }

  async isEnabled(): Promise<boolean> {
    const cfg = await this.getConfig();
    return cfg.enable === 1;
  }

  async getPort(): Promise<number> {
    const cfg = await this.getConfig();
    return cfg.port ?? 22;
  }

  async isLanOnly(): Promise<boolean> {
    const cfg = await this.getConfig();
    return cfg.permitLanAccessOnly === 1;
  }

  async isSftpEnabled(): Promise<boolean> {
    const cfg = await this.getConfig();
    return cfg.useSftp === 1;
  }

  async enable(port = 22, lanOnly = true): Promise<boolean> {
    await this.client.power.setSshConfig({
      enabled: true,
      port,
      permitLanAccessOnly: lanOnly,
    });
    return true;
  }

  async disable(): Promise<boolean> {
    await this.client.power.setSshConfig({ enabled: false });
    return true;
  }
}
