import { AuthPermissionsEnum } from "@/lib/types/auth.types";

/**
 * Permission config for (app) routes
 * Maps route to required permissions
 */
const ROUTE_PERMISSION_CONFIG: Record<
  string,
  { permissions: string[]; type: "oneOf" | "all" }
> = {
  dashboard: {
    permissions: [AuthPermissionsEnum.DASHBOARD_VIEW],
    type: "oneOf",
  },
  chargers: { permissions: [AuthPermissionsEnum.CHARGERS_VIEW], type: "oneOf" },
  "chargers/[id]": {
    permissions: [AuthPermissionsEnum.CHARGERS_DETAIL],
    type: "all",
  },
  sites: { permissions: [AuthPermissionsEnum.SITES_VIEW], type: "oneOf" },
  "sites/[id]": {
    permissions: [AuthPermissionsEnum.SITES_DETAIL],
    type: "all",
  },
  profile: { permissions: [AuthPermissionsEnum.PROFILE_VIEW], type: "all" },
  reporting: { permissions: [AuthPermissionsEnum.REPORTS_VIEW], type: "oneOf" },
  credentials: {
    permissions: [AuthPermissionsEnum.CREDENTIALS_VIEW],
    type: "oneOf",
  },
  "energy-resources": {
    permissions: [AuthPermissionsEnum.ENERGY_RESOURCES_VIEW],
    type: "oneOf",
  },
};

export const ROUTE_PERMISSION_CONFIG_EXPORT = ROUTE_PERMISSION_CONFIG;
