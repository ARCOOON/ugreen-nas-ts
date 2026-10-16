import { NasResource } from "./base.ts";

export class NetworkInterface extends NasResource<any> {
  get name(): string {
    return this.raw.interface ?? "";
  }

  get isConnected(): boolean {
    return this.raw.connection === 1;
  }

  get macAddress(): string {
    return this.raw.hardware ?? "";
  }

  get duplex(): string {
    return this.raw.duplex ?? "";
  }

  get speed(): number {
    return this.raw.speed ?? 0;
  }

  get mtu(): number {
    return this.raw.mtu ?? 1500;
  }

  get ipv4(): Record<string, any> {
    return this.raw.ipv4 ?? {};
  }

  get ip(): string {
    return this.ipv4.ipaddr ?? "";
  }

  get netmask(): string {
    return this.ipv4.netmask ?? "";
  }

  get gateway(): string {
    return this.ipv4.gateway ?? "";
  }

  get dns(): string[] {
    return this.ipv4.dns ?? [];
  }

  get isDhcp(): boolean {
    return Boolean(this.ipv4.auto ?? true);
  }

  async setDhcp(mtu = 1500): Promise<NetworkInterface> {
    await this.client.network.configureInterface(this.name, {
      dhcp: true,
      mtu,
    });
    const updated = await this.client.network.get(this.name);
    if (updated) {
      this._refresh(updated.raw);
    }
    return this;
  }

  async setStaticIp(options: {
    ip: string;
    subnetMask: string;
    gateway?: string;
    dns?: string[];
    mtu?: number;
  }): Promise<NetworkInterface> {
    await this.client.network.configureInterface(this.name, {
      dhcp: false,
      ip: options.ip,
      subnetMask: options.subnetMask,
      gateway: options.gateway,
      dns: options.dns,
      mtu: options.mtu ?? 1500,
    });
    const updated = await this.client.network.get(this.name);
    if (updated) {
      this._refresh(updated.raw);
    }
    return this;
  }
}

export class GeneralNetworkSettings extends NasResource<any> {
  get dnsServers(): string[] {
    return this.raw.dns ?? [];
  }

  get dnsMode(): number {
    return this.raw.dns_mode ?? 1;
  }

  get defaultGatewayIp(): string {
    return this.raw.ipv4_gateway?.ipaddr ?? "";
  }

  get defaultGatewayIface(): string {
    return this.raw.ipv4_gateway?.interface ?? "";
  }

  async setDns(dnsServers: string[]): Promise<GeneralNetworkSettings> {
    await this.client.network.setGeneralSettings({ dns: dnsServers });
    const updated = await this.client.network.getGeneralSettings();
    this._refresh(updated.raw);
    return this;
  }
}
