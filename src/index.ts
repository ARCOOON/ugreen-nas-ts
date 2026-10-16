export { UgreenNasClient } from "./client.ts";
export * from "./enums.ts";
export * from "./models/index.ts";
export * from "./managers/index.ts";
export type {
  ApiResponse,
  FanConfig,
  LoginResult,
  NasDisk,
  NasGroup,
  NasUser,
  NasVolume,
  NfsConfig,
  PowerConfig,
  SmbConfig,
  TerminalConfig,
  UgreenNasConfig,
} from "./types.ts";

// Legacy procedural modules for backwards compatibility
export { NetworkModule } from "./modules/network.ts";
export { PowerModule } from "./modules/power.ts";
export { SharesModule } from "./modules/shares.ts";
export { StorageModule } from "./modules/storage.ts";
export { UsersModule } from "./modules/users.ts";
