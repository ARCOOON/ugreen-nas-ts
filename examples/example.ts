/**
 * Example: Connect to UGREEN NAS and manage resources using the TypeScript OOP SDK.
 * Run with: node --experimental-strip-types examples/example.ts
 */

import { UgreenNasClient } from "../src/index.ts";

const UGLINK_ID = process.env.UGREEN_NAS_UGLINK || "https://ug.link/your-nas-alias";
const BASE_URL = process.env.UGREEN_NAS_URL; // e.g. "https://192.168.1.100"
const USERNAME = process.env.UGREEN_NAS_USER || "admin";
const PASSWORD = process.env.UGREEN_NAS_PASS || "your-password";

async function main() {
  console.log("Initializing TypeScript UGREEN NAS Client...");

  const client = new UgreenNasClient(
    BASE_URL ? { baseUrl: BASE_URL } : { uglinkId: UGLINK_ID }
  );

  console.log("Logging into NAS...");
  await client.login(USERNAME, PASSWORD);
  console.log("Authentication successful!");

  // 1. Hardware Info
  const sysinfo = await client.getSystemInfo();
  console.log(`Device: ${sysinfo.model || "UGREEN NAS"} (OS: ${sysinfo.version})`);

  // 2. Users
  console.log("\n[Users]");
  const users = await client.users.all();
  for (const user of users) {
    console.log(` - ${user.username} (UID: ${user.uid}, Admin: ${user.isAdmin})`);
  }

  // 3. Network Interfaces
  console.log("\n[Network Interfaces]");
  const ifaces = await client.network.interfaces.all();
  for (const iface of ifaces) {
    console.log(` - ${iface.name}: ${iface.ip} (Connected: ${iface.isConnected})`);
  }

  // 4. Storage & Drives
  console.log("\n[Physical Drives]");
  const disks = await client.storage.disks.all();
  for (const disk of disks) {
    console.log(` - ${disk.name}: ${disk.model} (${disk.sizeTb} TB), Temp: ${disk.temperature}°C, Healthy: ${disk.isHealthy}`);
  }

  console.log("\n[Volumes]");
  const volumes = await client.storage.volumes.all();
  for (const vol of volumes) {
    console.log(` - ${vol.name}: ${vol.usedGb} GB / ${vol.totalTb} TB (${vol.usagePercent}%)`);
  }

  // 5. Shared Folders
  console.log("\n[Shared Folders]");
  const shares = await client.shares.all();
  for (const share of shares) {
    console.log(` - ${share.name} (${share.path})`);
  }

  // 6. Fan Speed
  const fan = client.power.fan;
  console.log(`\nFan Mode: ${await fan.getMode()}`);
}

main().catch(console.error);
