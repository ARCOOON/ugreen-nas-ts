import type { UgreenNasClient } from "../client.ts";
import type { GeneralNetworkSettings, NetworkInterface } from "../types.ts";

export class NetworkModule {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all physical and virtual interfaces. */
  async listInterfaces(): Promise<NetworkInterface[]> {
    const res = await this.client.request<{ ifaces: NetworkInterface[] }>("GET", "/ugreen/v1/network/iface/list");
    return res.data?.ifaces || [];
  }

  /** Get interface details by name (e.g. 'eth0'). */
  async getInterface(name: string): Promise<NetworkInterface | undefined> {
    const list = await this.listInterfaces();
    return list.find((i) => i.interface === name);
  }

  /** Configure interface IP and MTU settings (DHCP or Static). */
  async configureInterface(
    ifaceName: string,
    options: {
      dhcp: boolean;
      ip?: string;
      subnetMask?: string;
      gateway?: string;
      mtu?: number;
      dns?: string[];
    }
  ): Promise<any> {
    const payload = {
      interface: ifaceName,
      mtu: options.mtu ?? 1500,
      ipv4: {
        auto: options.dhcp,
        ipaddr: options.dhcp ? "" : (options.ip || ""),
        netmask: options.dhcp ? "" : (options.subnetMask || ""),
        gateway: options.dhcp ? "" : (options.gateway || ""),
        dns: options.dns || [],
      },
    };
    return this.client.request("POST", "/ugreen/v1/network/iface/set", { body: payload });
  }

  /** Get general network configurations (DNS, gateways). */
  async getGeneralSettings(): Promise<GeneralNetworkSettings> {
    const res = await this.client.request<{ general: GeneralNetworkSettings }>("GET", "/ugreen/v1/network/general/get");
    return res.data?.general || ({} as GeneralNetworkSettings);
  }

  /** Set general network settings. */
  async setGeneralSettings(options: {
    dns?: string[];
    dnsMode?: number;
    priorIpv4?: number;
  }): Promise<any> {
    const payload = {
      dns: options.dns || [],
      dns_mode: options.dnsMode ?? 1,
      prior_ipv4: options.priorIpv4 ?? 1,
    };
    return this.client.request("POST", "/ugreen/v1/network/general/set", { body: payload });
  }

  /** List configured gateways. */
  async getGateways(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/network/general/gateway_get");
    return res.data;
  }

  /** Set default network gateway. */
  async setDefaultGateway(ifaceName: string, gatewayIp: string): Promise<any> {
    return this.client.request("POST", "/ugreen/v1/network/general/gateway_set", {
      body: { interface: ifaceName, ipaddr: gatewayIp },
    });
  }
}
