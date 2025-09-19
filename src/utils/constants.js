const USER_ROLES = {
  NTC_ADMIN: "ntc_admin",
  BUS_OPERATOR: "bus_operator",
  COMMUTER: "commuter",
};

const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

const PERMISSIONS = {
  MANAGE_ROUTES: "canManageRoutes",
  MANAGE_BUSES: "canManageBuses",
  VIEW_REPORTS: "canViewReports",
  MANAGE_USERS: "canManageUsers",
  TRACK_BUSES: "canTrackBuses",
};

const SRI_LANKAN_PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  LOCKED: 423,
  INTERNAL_SERVER_ERROR: 500,
};

const VALIDATION_PATTERNS = {
  SRI_LANKAN_PHONE: /^(\+94|0)[0-9]{9}$/,
  POSTAL_CODE: /^[0-9]{5}$/,
  PASSWORD_STRENGTH: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
  USERNAME: /^[a-z0-9_]+$/,
  MONGODB_OBJECT_ID: /^[0-9a-fA-F]{24}$/,
};

module.exports = {
  USER_ROLES,
  USER_STATUSES,
  PERMISSIONS,
  SRI_LANKAN_PROVINCES,
  HTTP_STATUS,
  VALIDATION_PATTERNS,
};
