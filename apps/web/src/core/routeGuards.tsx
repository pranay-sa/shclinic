import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { authStore } from "@/core/auth";
import { canAccessPortal } from "@/core/rbac";
import type { PortalId } from "@/config/portals";

type PortalAuthGuardProps = {
  portal: PortalId;
  loginPath: string;
  children: ReactNode;
};

type PortalLoginGuardProps = {
  portal: PortalId;
  homePath: string;
  children: ReactNode;
};

export function PortalAuthGuard({ portal, loginPath, children }: PortalAuthGuardProps) {
  const token = authStore.getToken();
  const user = authStore.getUser();
  if (!token || !user) {
    return <Navigate to={loginPath} replace />;
  }
  if (!canAccessPortal(user.role, portal)) {
    authStore.clear();
    return <Navigate to={loginPath} replace />;
  }
  return <>{children}</>;
}

export function PortalLoginGuard({ portal, homePath, children }: PortalLoginGuardProps) {
  const token = authStore.getToken();
  const user = authStore.getUser();
  if (token && user && canAccessPortal(user.role, portal)) {
    return <Navigate to={homePath} replace />;
  }
  return <>{children}</>;
}
