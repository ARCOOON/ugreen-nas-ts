import type { UgreenNasClient } from "../client.ts";
import { FanControl, PowerSettings, SshTerminal } from "../models/power.ts";
import type { FanConfig, PowerConfig, TerminalConfig } from "../types.ts";

export class PowerManager {
  private client: UgreenNasClient;
  public fan: FanControl;
  public ssh: SshTerminal;

  constructor(client: UgreenNasClient) {
    this.client = client;
    this.fan = new FanControl(client);
    this.ssh = new SshTerminal(client);
  }

  /** Get power, WoL, and drive sleep settings model. */
  async getSettings(): Promise<PowerSettings> {
    const res = await this.client.request<PowerConfig>("GET", "/ugreen/v1/hardware/power/config");
    return new PowerSettings(this.client, res.data);
  }

  /** Reboot the NAS. */
  async reboot(): Promise<boolean> {
    const res = await this.client.request("POST", "/ugreen/v1/desktop/reboot");
    return res.code === 200;
  }

  /** Shutdown the NAS. */
  async poweroff(): Promise<boolean> {
    const res = await this.client.request("POST", "/ugreen/v1/desktop/poweroff");
    return res.code === 200;
  }

  /** Raw power configuration dictionary. */
  async getPowerConfig(): Promise<PowerConfig> {
    const res = await this.client.request<PowerConfig>("GET", "/ugreen/v1/hardware/power/config");
    return res.data;
  }

  /** Update power configuration. */
  async setPowerConfig(options: {
    wakeOnLan?: boolean;
    powerBootOnAc?: boolean;
    hardDriveSleepMinutes?: number;
    enableScheduledPower?: boolean;
    timeSwitches?: any[];
  }): Promise<any> {
    const current = await this.getPowerConfig();
    const payload = {
      wake_on: options.wakeOnLan ?? current.wake_on,
      power_boot: options.powerBootOnAc ?? current.power_boot,
      hard_drive_flag: options.hardDriveSleepMinutes !== undefined ? options.hardDriveSleepMinutes > 0 : current.hard_drive_flag,
      hard_drive_time: options.hardDriveSleepMinutes ?? current.hard_drive_time,
      hard_drive_unit: "M",
      hard_drive_strategy: current.hard_drive_strategy ?? 1,
      enable_scheduled_power: options.enableScheduledPower ?? current.enable_scheduled_power,
      time_switches: options.timeSwitches ?? current.time_switches,
    };
    return this.client.request("POST", "/ugreen/v1/hardware/power/start", { body: payload });
  }

  /** Get fan configuration and operating mode. */
  async getFanConfig(): Promise<FanConfig> {
    const res = await this.client.request<FanConfig>("GET", "/ugreen/v1/hardware/fan/config");
    return res.data;
  }

  /** Set fan speed mode: 1 = quiet, 2 = standard, 3 = full/performance. */
  async setFanMode(mode: 1 | 2 | 3): Promise<any> {
    return this.client.request("POST", `/ugreen/v1/hardware/fan/setfan?mode=${mode}`);
  }

  /** Get SSH and Telnet terminal settings. */
  async getTerminalConfig(): Promise<TerminalConfig> {
    const res = await this.client.request<TerminalConfig>("GET", "/ugreen/v1/terminal/get");
    return res.data;
  }

  /** Configure SSH service. */
  async setSshConfig(options: {
    enabled: boolean;
    port?: number;
    permitLanAccessOnly?: boolean;
    useSftp?: boolean;
  }): Promise<any> {
    const current = await this.getTerminalConfig();
    const payload = {
      SshConfig: {
        enable: options.enabled ? 1 : 2,
        port: options.port ?? current.SshConfig?.port ?? 22,
        permitLanAccessOnly: options.permitLanAccessOnly !== undefined ? (options.permitLanAccessOnly ? 1 : 2) : current.SshConfig?.permitLanAccessOnly ?? 1,
        useSftp: options.useSftp !== undefined ? (options.useSftp ? 1 : 2) : current.SshConfig?.useSftp ?? 1,
        encryptLevel: current.SshConfig?.encryptLevel ?? 3,
        exTimeDuration: current.SshConfig?.exTimeDuration ?? 3,
      },
      TelnetConfig: current.TelnetConfig ?? { enable: 2, port: 23 },
    };
    return this.client.request("POST", "/ugreen/v1/terminal/set", { body: payload });
  }

  /** Mute buzzer alert. */
  async muteBuzzer(): Promise<any> {
    return this.client.request("POST", "/ugreen/v1/hardware/buzzer/mute");
  }
}
