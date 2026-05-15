import type { PortalId } from "@/config/portals";

export type AppRole =
  | "super_admin"
  | "clinic_admin"
  | "frontdesk_exec"
  | "doctor"
  | "lab_technician"
  | "pharmacist"
  | "cashier"
  | "auditor";

export type Permission =
  | "patients:read"
  | "patients:write"
  | "appointments:read"
  | "appointments:write"
  | "consultations:write"
  | "diagnostics:write"
  | "pharmacy:write"
  | "billing:write";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  super_admin: [
    "patients:read",
    "patients:write",
    "appointments:read",
    "appointments:write",
    "consultations:write",
    "diagnostics:write",
    "pharmacy:write",
    "billing:write"
  ],
  clinic_admin: [
    "patients:read",
    "patients:write",
    "appointments:read",
    "appointments:write",
    "diagnostics:write",
    "billing:write"
  ],
  frontdesk_exec: ["patients:read", "patients:write", "appointments:read", "appointments:write", "billing:write"],
  doctor: ["patients:read", "appointments:read", "consultations:write"],
  lab_technician: ["patients:read", "appointments:read", "diagnostics:write"],
  pharmacist: ["patients:read", "pharmacy:write"],
  cashier: ["billing:write", "appointments:read"],
  auditor: ["patients:read", "appointments:read"]
};

export const PORTAL_ACCESS: Record<PortalId, AppRole[]> = {
  frontdesk: ["super_admin", "clinic_admin", "frontdesk_exec", "cashier"],
  doctor: ["super_admin", "clinic_admin", "doctor"],
  lab: ["super_admin", "clinic_admin", "lab_technician"],
  pharmacy: ["super_admin", "clinic_admin", "pharmacist"]
};

export const canAccessPortal = (role: AppRole, portal: PortalId): boolean => PORTAL_ACCESS[portal].includes(role);

export const hasPermission = (role: AppRole, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role].includes(permission);
