# UGREEN NAS TypeScript SDK

[![TypeScript CI](https://github.com/ARCOOON/ugreen-nas-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/ARCOOON/ugreen-nas-ts/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript: 5.0+](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node: 24+](https://img.shields.io/badge/node-24+-green.svg)](https://nodejs.org/)

Object-Oriented Management SDK for **UGREEN NAS** devices running **UGOS Pro / UGOS** (DXP series: DXP2800, DXP4800, DXP6800, DXP8800).

Provides first-class domain models (`User`, `Group`, `NetworkInterface`, `Disk`, `Volume`, `SharedFolder`, etc.) with rich properties and behavior methods, fully compatible with Node 24+ (`--experimental-strip-types`) and modern runtimes.

---

## Features

- **Direct & Remote (UGREENlink) Access**: Connect via local IP (`https://192.168.1.x`) or by passing your UGREENlink ID (e.g. `my-nas-alias` or `https://ug.link/my-nas-alias`). Automatically resolves HTTPS relay domains via `api.ugnas.com`.
- **Zero External Dependencies**: Built-in RSA PKCS#1 v1.5 with Node `crypto` and standard `fetch`.
- **Rich Domain Models**:
  - `user.edit(...)`, `user.delete(adminPassword)`, `session.terminate()`
  - `group.edit(...)`, `group.delete()`
  - `iface.setDhcp()`, `iface.setStaticIp(...)`
  - `disk.getSmartInfo()`, `disk.temperature`, `disk.isHealthy`
  - `volume.getPathFreeSize(...)`, `volume.usedGb`, `volume.usagePercent`
  - `share.getUsers()`, `share.setPermissions(...)`
  - `services.smb.enable()`, `services.nfs.disable()`, `services.ssh.enable(...)`
  - `power.fan.setMode(FanMode.Standard)`, `power.getSettings()`, `power.reboot()`, `power.poweroff()`

---

## Supported Functionality

| Category | Features |
|---|---|
| **Users & Groups** | Local users, roles (`admin`, `users`), directory quotas, user group memberships, active session termination |
| **Network & IP** | Interface enumeration, link carrier status, DHCP vs Static IPv4, MTU, global DNS servers, gateway routing |
| **Storage & Disks** | SATA HDD & NVMe SSD status, slot bay mapping, temperature, S.M.A.R.T. health queries, RAID storage pools, volume allocation and path free size |
| **Shared Folders** | Shared folder creation, mount points, volume mapping, user/group read/write permissions |
| **File Services** | Service management for SMB/CIFS, NFS, FTP, WebDAV, Rsync, and SSH/SFTP terminal |
| **Power & Hardware** | Shutdown, reboot, Wake-on-LAN, AC power recovery, disk standby sleep timers, fan profiles (Quiet/Standard/Full), and buzzer control |

---

## Installation

### From Pre-Built Tarball Bundle (`.tgz`)
Download `ugreen-nas-sdk-1.1.0.tgz` from GitHub Actions artifacts or Releases and install it directly into your project:
```bash
npm install ./ugreen-nas-sdk-1.1.0.tgz
```

### Build `.tgz` Bundle Locally
```bash
npm install
npm run pack   # Compiles dist/ (.js + .d.ts) and generates ugreen-nas-sdk-1.1.0.tgz
```

---

## Quickstart & OOP Usage

```typescript
import { FanMode, UgreenNasClient } from "./src/index.ts";

// Connect via UGREENlink ID or direct URL
const client = new UgreenNasClient({
  uglinkId: "https://ug.link/my-nas-alias",
  // or baseUrl: "https://192.168.1.100"
});

// Authenticate
await client.login("admin", "my-password");

// 1. Users & Active Sessions
const users = await client.users.all();
for (const user of users) {
  console.log(`User: ${user.username} (Admin: ${user.isAdmin}, Quota: ${user.dirQuotaBytes})`);
  // await user.edit({ description: "Updated description" });
  // await user.delete("current-admin-password");
}

const sessions = await client.users.sessions();
for (const session of sessions) {
  console.log(`Session ${session.sessionId} from ${session.clientIp} (Current: ${session.isCurrentConnection})`);
  // await session.terminate();
}

// 2. Network Management
const ifaces = await client.network.interfaces.all();
for (const iface of ifaces) {
  console.log(`Interface ${iface.name}: IP=${iface.ip}, MAC=${iface.macAddress}, Connected=${iface.isConnected}`);
  // await iface.setStaticIp({ ip: "192.168.1.50", subnetMask: "255.255.255.0", gateway: "192.168.1.1" });
  // await iface.setDhcp();
}

const genNet = await client.network.getGeneralSettings();
console.log(`DNS: ${genNet.dnsServers}, Gateway: ${genNet.defaultGatewayIp}`);
// await genNet.setDns(["1.1.1.1", "8.8.8.8"]);

// 3. Storage, Disks, and Volumes
const disks = await client.storage.disks.all();
for (const disk of disks) {
  console.log(`Disk ${disk.name}: ${disk.model} (${disk.sizeTb} TB) Temp: ${disk.temperature}°C Healthy: ${disk.isHealthy}`);
  const smart = await disk.getSmartInfo();
}

const pools = await client.storage.pools.all();
for (const pool of pools) {
  console.log(`Pool ${pool.name}: RAID=${pool.raidLevel}, Capacity=${pool.totalTb} TB`);
}

const volumes = await client.storage.volumes.all();
for (const vol of volumes) {
  console.log(`Volume ${vol.name}: ${vol.usedGb} GB / ${vol.totalTb} TB (${vol.usagePercent}%)`);
  const freeBytes = await vol.getPathFreeSize("downloads");
}

// 4. Shares & File Services
const shares = await client.shares.all();
for (const share of shares) {
  console.log(`Share ${share.name} on ${share.path} (Mounted: ${share.isMounted})`);
  const shareUsers = await share.getUsers();
}

// Manage file sharing services
if (!(await client.services.smb.isEnabled())) {
  await client.services.smb.enable();
}

await client.services.nfs.enable();
await client.services.ssh.enable(22, true);

// 5. Power & Hardware Controls
const fan = client.power.fan;
console.log(`Fan Mode: ${await fan.getMode()}`);
await fan.setMode(FanMode.Standard);

const pwr = await client.power.getSettings();
console.log(`Wake-on-LAN: ${pwr.wakeOnLan}, HDD Sleep: ${pwr.hddSleepMinutes}m`);
await pwr.update({ wakeOnLan: true, hddSleepMinutes: 15 });

// await client.power.reboot();
// await client.power.poweroff();
```

---

## Documentation

- [Architecture & Protocol Specification](docs/ARCHITECTURE.md) - Deep dive into relay lookup, RSA SPKI handshake, and session tokens.
- [API Reference](docs/API_REFERENCE.md) - Detailed reference for all TypeScript classes, methods, and properties.
- [Reverse-Engineered Endpoints](docs/ENDPOINTS.md) - Catalog of 200+ UGOS Pro REST endpoints.
- [Runnable Example](examples/example.ts) - Example script with environment configuration.

---

## Disclaimer

This project is an independent open-source project and is not affiliated with, endorsed by, or associated with UGREEN (Shenzhen Ugreen Technology Co., Ltd.). UGOS and UGREEN are trademarks of Shenzhen Ugreen Technology Co., Ltd.

## License

[MIT](LICENSE)
