/**
 * Permission slugs — format: module--action (double dash)
 * Ported from ui-emobility-web/src/app/features/authentication/models/permissions.model.ts
 */

export enum AuthPermissionsEnum {
  // Profile & Dashboard
  PROFILE_VIEW = 'profile--view',
  PROFILE_EDIT = 'profile--edit',
  DASHBOARD_VIEW = 'dashboard--view',

  // Chargers
  CHARGERS_VIEW = 'chargers--view',
  CHARGERS_LIST = 'chargers--list',
  CHARGERS_DETAIL = 'chargers--detail',
  CHARGERS_SESSIONS_VIEW = 'chargers--sessions-view',
  CHARGERS_CREATE = 'chargers--create',
  CHARGERS_EDIT = 'chargers--edit',
  CHARGERS_DELETE = 'chargers--delete',

  // Charger commands & config
  CHARGERS_COMMANDS_OCPP = 'chargers--commands-ocpp',
  CHARGERS_COMMANDS_POLLEY = 'chargers--commands-polley',
  CHARGERS_PRIORITIZE_CHARGE = 'chargers--prioritize-charge',
  CHARGERS_DETAIL_LIVE_VIEW = 'chargers--detail-live-view',
  CHARGERS_DETAIL_HISTORY_VIEW = 'chargers--detail-history-view',
  CHARGERS_DETAIL_CONFIG_VIEW = 'chargers--detail-config-view',
  CHARGERS_DETAIL_CONFIG_MANAGE = 'chargers--detail-config-manage',
  CHARGERS_DETAIL_CONNECTORS_VIEW = 'chargers--detail-connectors-view',
  CHARGERS_DETAIL_CONNECTORS_MANAGE = 'chargers--detail-connectors-manage',

  // Sites
  SITES_VIEW = 'sites--view',
  SITES_LIST = 'sites--list',
  SITES_DETAIL = 'sites--detail',
  SITES_CREATE = 'sites--create',
  SITES_EDIT = 'sites--edit',
  SITES_DELETE = 'sites--delete',

  // Reports
  REPORTS_VIEW = 'reports--view',
  REPORTS_USER_LOGS = 'reports--user-logs',
  REPORTS_ALARMS_CHARGERS = 'reports--alarms-chargers',
  REPORTS_ALARMS_CONNECTORS = 'reports--alarms-connectors',
  REPORTS_CONSUMPTION_SITES = 'reports--consumption-sites',
  REPORTS_CONSUMPTION_USERS = 'reports--consumption-users',
  REPORTS_CHARGE_SESSIONS = 'reports--charge-sessions',
  REPORTS_OCPP_MESSAGES = 'reports--ocpp-messages',
  REPORTS_ENERGY_VARIABLES = 'reports--energy-variables',
  REPORTS_SYSTEM_UPTIMES = 'reports--system-uptimes',
}
