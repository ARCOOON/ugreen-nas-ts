import type { UgreenNasClient } from "../client.ts";
import { GeneralNetworkSettings, NetworkInterface } from "../models/network.ts";

export class NetworkInterfaceManager {
  private client: UgreenNasClient;

  constructor(client: UgreenNasClient) {
    this.client = client;
  }

  /** List all physical and virtual interfaces. */
  async all(): Promise<NetworkInterface[]> {
    const res = await this.client.request<{ ifaces: any[] }>("GET", "/ugreen/v1/network/iface/list");
    const ifaces = res.data?.ifaces || [];
    return ifaces.map((item) => new NetworkInterface(this.client, item));
  }

  /** Get interface details by name (e.g. 'eth0'). */
  async get(name: string): Promise<NetworkInterface | undefined> {
    const list = await this.all();
    return list.find((i) => i.name === name);
  }
}

export class NetworkManager {
  private client: UgreenNasClient;
  public interfaces: NetworkInterfaceManager;

  constructor(client: UgreenNasClient) {
    this.client = client;
    this.interfaces = new NetworkInterfaceManager(client);
  }

  /** Shorthand to get an interface. */
  async get(name: string): Promise<NetworkInterface | undefined> {
    return this.interfaces.get(name);
  }

  /** Shorthand to list all interfaces. */
  async allInterfaces(): Promise<NetworkInterface[]> {
    return this.interfaces.all();
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
    const res = await this.client.request<{ general: any }>("GET", "/ugreen/v1/network/general/get");
    return new GeneralNetworkSettings(this.client, res.data?.general || {});
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

  /** Get status of bonded interfaces. */
  async getBondStatus(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/network/bond/status");
    return res.data;
  }

  /** Get status of network bridges. */
  async getBridgeStatus(): Promise<any> {
    const res = await this.client.request("GET", "/ugreen/v1/network/bridge/status");
    return res.data;
  }
}
