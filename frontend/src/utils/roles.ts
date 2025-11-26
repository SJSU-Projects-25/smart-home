/** Role utilities. */

export type UserRole = "owner" | "technician" | "staff" | "admin";

export const ROLES = {
  OWNER: "owner" as const,
  TECHNICIAN: "technician" as const,
  STAFF: "staff" as const,
  ADMIN: "admin" as const,
} as const;

export function hasRole(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function isOwner(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.OWNER;
}

export function isTechnician(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.TECHNICIAN;
}

export function isStaff(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.STAFF;
}

export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.ADMIN;
}

