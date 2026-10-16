/**
 * TypeScript definitions for UGREEN NAS Management SDK.
 */

export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  data: T;
  time?: number;
}

export interface UgreenNasConfig {
  baseUrl?: string;
  uglinkId?: string;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
}

export interface LoginResult {
  token: string;
  token_id: string;
  public_key: string;
  username: string;
  role: string;
  model: string;
  system_version: string;
  uid: number;
  [key: string]: any;
}

// Network Interfaces
export interface NetworkInterface {
  interface: string;
  connection: number;
  duplex: string;
  hardware?: string;
  mtu?: number;
  speed?: number;
  ipv4: {
    auto?: boolean;
    ipaddr: string;
    netmask?: string;
    gateway?: string;
    dns?: string[];
    [key: string]: any;
  };
  ipv6?: any;
  [key: string]: any;
}

export interface GeneralNetworkSettings {
  dns: string[];
  dns_mode: number;
  prior_ipv4: number;
  ipv4_gateway?: {
    interface: string;
    ipaddr: string;
  };
  [key: string]: any;
}

// Power & Hardware
export interface PowerConfig {
  wake_on: boolean;
  power_boot: boolean;
  hard_drive_flag: boolean;
  hard_drive_time: number;
  hard_drive_unit: string;
  enable_scheduled_power: boolean;
  time_switches: Array<{
    id?: number;
    enable: boolean;
    type: number;
    time: string;
    repeat: number[];
  }>;
  [key: string]: any;
}

export interface FanConfig {
  mode: number; // 1 = quiet, 2 = standard, 3 = full
  result: number;
  support_custom?: boolean;
  [key: string]: any;
}

export interface TerminalConfig {
  SshConfig: {
    enable: number; // 1 = enabled, 2 = disabled
    port: number;
    permitLanAccessOnly: number;
    useSftp: number;
    [key: string]: any;
  };
  TelnetConfig: {
    enable: number;
    port: number;
    [key: string]: any;
  };
}

// Users & Groups
export interface NasUser {
  uid: number;
  username: string;
  role: string;
  email?: string;
  phone?: string;
  description?: string;
  dir_quota?: number;
  expire_time?: number;
  groups: Array<{
    gid: number;
    name: string;
  }>;
  [key: string]: any;
}

export interface NasGroup {
  gid: number;
  name: string;
  description?: string;
  members?: number[];
  [key: string]: any;
}

// Storage & Disks
export interface NasDisk {
  name: string;
  dev_name: string;
  model: string;
  serial: string;
  size: number;
  slot: string;
  interface_type: string;
  type: number;
  temperature?: number;
  health?: number;
  [key: string]: any;
}

export interface StoragePool {
  name: string;
  level: string; // raid0, raid1, raid5, jbod
  label: string;
  status: number;
  total: number;
  free?: number;
  pvs?: string;
  [key: string]: any;
}

export interface NasVolume {
  name: string;
  label: string;
  device: string;
  filesystem: string;
  uuid: string;
  total: number;
  used: number;
  health: number;
  [key: string]: any;
}

// Shares & Protocols
export interface SharedFolder {
  id: number;
  name: string;
  path: string;
  type: number;
  is_mount: boolean;
  size?: number;
  [key: string]: any;
}

export interface SmbConfig {
  status: boolean;
  work_group: string;
  hide_share_dir_for_no_permission?: boolean;
  enable_log?: boolean;
  [key: string]: any;
}

export interface NfsConfig {
  enableNfsServer: boolean;
  maximumNFSProtocol?: string;
  applyDefaultUNIXPerm?: boolean;
  [key: string]: any;
}
