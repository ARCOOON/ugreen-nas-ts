/**
 * Constants and Types for UGREEN NAS UGOS Pro.
 * Uses `as const` objects for compatibility with Node native TypeScript and type-stripping runners.
 */

export const FanMode = {
  Quiet: 1,
  Standard: 2,
  FullSpeed: 3,
} as const;
export type FanMode = (typeof FanMode)[keyof typeof FanMode];

export const UserRole = {
  Admin: "admin",
  User: "users",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RaidLevel = {
  Basic: "basic",
  Jbod: "jbod",
  Raid0: "raid0",
  Raid1: "raid1",
  Raid5: "raid5",
  Raid6: "raid6",
  Raid10: "raid10",
} as const;
export type RaidLevel = (typeof RaidLevel)[keyof typeof RaidLevel];
