# UGREEN NAS TypeScript SDK - API Reference

Complete class, method, and property reference for the TypeScript SDK (`@ugreen-nas/sdk`).

---

## 1. `UgreenNasClient`

Core connection coordinator and authentication manager.

### Constructor
```typescript
new UgreenNasClient({
  baseUrl?: string;
  uglinkId?: string;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
})
```

### Client Properties
| Property | Type | Description |
|---|---|---|
| `users` | `UserManager` | User accounts, quotas, and sessions manager |
| `groups` | `GroupManager` | Local group management |
| `network` | `NetworkManager` | Interfaces, IP addresses, DNS, and gateway manager |
| `storage` | `StorageManager` | Physical drives, RAID pools, and volumes manager |
| `shares` | `ShareManager` | Shared folder paths, permissions, and protocols |
| `services` | `ServicesManager` | File sharing daemons (SMB, NFS, FTP, WebDAV, Rsync, SSH) |
| `power` | `PowerManager` | Power states, reboot, shutdown, fan control, and sleep timers |

### Client Methods
- `login(username: string, password: string, keepalive?: boolean): Promise<LoginResult>`: Authenticates with RSA encryption and acquires session tokens.
- `isLoggedIn(): Promise<boolean>`: Returns `true` if session is active.
- `heartbeat(): Promise<any>`: Keeps the session alive.
- `getSystemInfo(): Promise<any>`: Hardware model, CPU, serial, and OS version.

---

## 2. Users & Sessions (`client.users`)

### `UserManager`
- `all(reverse?: boolean): Promise<User[]>`: List all local users.
- `get(uid: number): Promise<User | undefined>`: Look up user by UID.
- `getByName(username: string): Promise<User | undefined>`: Look up user by username.
- `current(): Promise<User>`: Profile of logged-in user.
- `create(options: { username: string, password: string, role?: string, ... }): Promise<User>`: Create a new user.
- `edit(uid: number, options: Partial<NasUser>): Promise<any>`: Update user role, email, phone, or quota.
- `delete(uids: number | number[], adminPassword: string): Promise<boolean>`: Delete users (requires admin password).
- `sessions(pageNum?: number, pageSize?: number): Promise<UserSession[]>`: List active login sessions.
- `terminateSession(sessionId: number | string): Promise<boolean>`: Disconnect active session.

### `User` Model
| Property / Method | Returns | Description |
|---|---|---|
| `username` | `string` | Account username |
| `uid` | `number` | User identifier |
| `role` | `string` | `"admin"` or `"users"` |
| `isAdmin` | `boolean` | True if user has administrative rights |
| `email` | `string` | Email address |
| `phone` | `string` | Phone number |
| `dirQuotaBytes` | `number` | Directory disk quota in bytes |
| `groups` | `Array<{ gid: number; name: string }>` | Group memberships |
| `edit(options)` | `Promise<User>` | Updates user details and refreshes self |
| `delete(adminPassword)` | `Promise<boolean>` | Deletes this user |

### `UserSession` Model
| Property / Method | Returns | Description |
|---|---|---|
| `sessionId` | `number` | Unique session ID |
| `username` | `string` | Logged-in user |
| `clientIp` | `string` | Remote IP address |
| `host` | `string` | Host / domain |
| `isCurrentConnection` | `boolean` | True if this is the active SDK connection |
| `connectionDurationSeconds` | `number` | Duration connected in seconds |
| `terminate()` | `Promise<boolean>` | Disconnect this session |

---

## 3. Network (`client.network`)

### `NetworkManager`
- `interfaces.all(): Promise<NetworkInterface[]>`: All network adapters.
- `interfaces.get(name: string): Promise<NetworkInterface | undefined>`: Get adapter by name (e.g. `"eth0"`).
- `getGeneralSettings(): Promise<GeneralNetworkSettings>`: DNS servers, default gateway.
- `setGeneralSettings(options: { dns?: string[], ... }): Promise<any>`: Configure global DNS.
- `getGateways(): Promise<any>`: Current IPv4/IPv6 gateways.
- `setDefaultGateway(ifaceName: string, gatewayIp: string): Promise<any>`: Set primary network gateway.

### `NetworkInterface` Model
| Property / Method | Returns | Description |
|---|---|---|
| `name` | `string` | Adapter name (`eth0`, `eth1`) |
| `isConnected` | `boolean` | Physical link carrier status |
| `macAddress` | `string` | Hardware MAC address |
| `ip` | `string` | Current IPv4 address |
| `netmask` | `string` | Subnet mask |
| `gateway` | `string` | Interface default gateway |
| `dns` | `string[]` | Per-interface DNS servers |
| `isDhcp` | `boolean` | True if DHCP client is enabled |
| `mtu` | `number` | MTU size (default 1500) |
| `setDhcp(mtu?: number)` | `Promise<NetworkInterface>` | Switches interface to automatic DHCP |
| `setStaticIp({ ip, subnetMask, ... })` | `Promise<NetworkInterface>` | Assigns static IP configuration |

---

## 4. Storage & Disks (`client.storage`)

### `StorageManager`
- `disks.all(): Promise<Disk[]>`: Physical SATA HDDs and NVMe SSDs.
- `disks.get(slotOrName: string): Promise<Disk | undefined>`: Get drive by device name (`"sda"`) or slot (`"ata1"`).
- `pools.all(): Promise<StoragePool[]>`: RAID storage pools.
- `volumes.all(): Promise<Volume[]>`: Logical filesystems.
- `getPathFreeSize(path: string): Promise<number>`: Free space in bytes under a path.

### `Disk` Model
| Property / Method | Returns | Description |
|---|---|---|
| `name` | `string` | Dev name (`sda`, `nvme0n1`) |
| `model` | `string` | Drive manufacturer model |
| `serial` | `string` | Hardware serial number |
| `slot` | `string` | Bay slot (`ata1`, `nvme1`) |
| `sizeTb` / `sizeGb` | `number` | Storage capacity |
| `temperature` | `number | undefined` | Temperature in Celsius |
| `isHealthy` | `boolean` | True if drive is healthy |
| `getSmartInfo()` | `Promise<any>` | Fetch latest S.M.A.R.T. health test attributes |

### `Volume` Model
| Property / Method | Returns | Description |
|---|---|---|
| `name` | `string` | Volume name (`dm-0`, `volume1`) |
| `filesystem` | `string` | Filesystem (`btrfs`, `ext4`) |
| `totalTb` / `usedGb` | `number` | Volume space allocation |
| `usagePercent` | `number` | Percentage of space consumed |
| `getPathFreeSize(subpath?: string)` | `Promise<number>` | Remaining free space under volume path |

---

## 5. Shares & Protocols (`client.shares` / `client.services`)

### `ShareManager`
- `all(): Promise<SharedFolder[]>`: List all shared network folders.
- `get(idOrName: number | string): Promise<SharedFolder | undefined>`: Lookup share by name or ID.
- `getShareUsers(shareId: number): Promise<any[]>`: Access permission rules.
- `setSharePermissions(shareId: number, permissions: any[]): Promise<any>`: Apply read/write permissions.

### `SharedFolder` Model
| Property / Method | Returns | Description |
|---|---|---|
| `id` | `number` | Share identifier |
| `name` | `string` | Folder share name |
| `path` | `string` | Absolute path on volume (`/volume1/downloads`) |
| `isMounted` | `boolean` | Volume mount status |
| `getUsers()` | `Promise<any[]>` | Access rights for users and groups |
| `setPermissions(rules)` | `Promise<any>` | Update user/group permissions |

### `ServicesManager` (`client.services`)
- `client.services.smb`: SMB/CIFS service (`isEnabled()`, `getWorkgroup()`, `enable()`, `disable()`).
- `client.services.nfs`: NFS server (`isEnabled()`, `enable()`, `disable()`).
- `client.services.ftp`: FTP daemon (`enable()`, `disable()`).
- `client.services.webdav`: WebDAV server (`enable()`, `disable()`).
- `client.services.rsync`: Rsync daemon (`enable()`, `disable()`).
- `client.services.ssh`: SSH terminal (`isEnabled()`, `getPort()`, `isLanOnly()`, `enable()`, `disable()`).

---

## 6. Power & Hardware (`client.power`)

### `PowerManager`
- `fan`: `FanControl` profile manager.
- `getSettings(): Promise<PowerSettings>`: Fetch `PowerSettings` model.
- `reboot(): Promise<boolean>`: Device reboot.
- `poweroff(): Promise<boolean>`: Device shutdown.
- `muteBuzzer(): Promise<any>`: Mute alert tone.

### `FanControl` Model
- `getMode(): Promise<FanMode>`: Current speed (`FanMode.Quiet`, `FanMode.Standard`, `FanMode.FullSpeed`).
- `setMode(mode: FanMode | 1 | 2 | 3): Promise<boolean>`: Update fan speed.

### `PowerSettings` Model
- `wakeOnLan`: Wake-on-LAN enabled.
- `powerBootOnAc`: Automatic boot after power restoration.
- `hddSleepMinutes`: Drive standby timer (0 = never sleep).
- `update({ wakeOnLan?, hddSleepMinutes?, ... }): Promise<PowerSettings>`: Save changes.
