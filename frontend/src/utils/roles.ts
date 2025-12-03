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

/**
 * Get the overview/dashboard path based on user role.
 * @param role - User role
 * @returns Path to the role-specific overview page
 */
export function getOverviewPath(role: UserRole | undefined): string {
  switch (role) {
    case ROLES.TECHNICIAN:
      return "/tech/overview";
    case ROLES.STAFF:
      return "/ops/overview";
    case ROLES.ADMIN:
      return "/admin/overview";
    case ROLES.OWNER:
    default:
      return "/overview";
  }
}

