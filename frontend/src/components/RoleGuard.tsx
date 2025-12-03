/** Role-based access control component. */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { UserRole, getOverviewPath } from "../utils/roles";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const overviewPath = getOverviewPath(user.role);
      router.push(overviewPath);
    }
  }, [user, allowedRoles, router]);

  if (!user) {
    return fallback || <div>Redirecting to login...</div>;
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || <div>Access denied</div>;
  }

  return <>{children}</>;
}

