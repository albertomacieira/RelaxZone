const adminUsersRepo = require("./admin.users.repo");
const ApiError = require("../../utils/apiError");

const ALLOWED_ROLES = ["ADMIN", "CLIENT"];

function toInt(val, def) {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
}

const listUsers = async ({ q, role, is_active, limit, offset }) => {
  const lim = Math.min(Math.max(toInt(limit, 50), 1), 200);
  const off = Math.max(toInt(offset, 0), 0);

  // filtros opcionais
  const filters = {};
  if (q) filters.q = String(q);
  if (role) filters.role = String(role);
  if (typeof is_active !== "undefined") filters.is_active = is_active;

  return adminUsersRepo.list({ ...filters, limit: lim, offset: off });
};

const getUser = async (userId) => {
  const user = await adminUsersRepo.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const updateRole = async (userId, role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new ApiError(400, `Invalid role. Allowed: ${ALLOWED_ROLES.join(", ")}`);
  }

  const ok = await adminUsersRepo.updateRole(userId, role);
  if (!ok) throw new ApiError(404, "User not found");

  const user = await adminUsersRepo.findById(userId);
  return user;
};

const updateActive = async (userId, is_active) => {
  // aceita true/false, "1"/"0", 1/0
  const value =
    is_active === true || is_active === 1 || is_active === "1" ? 1 :
    is_active === false || is_active === 0 || is_active === "0" ? 0 :
    null;

  if (value === null) throw new ApiError(400, "is_active must be 0/1 (or true/false)");

  const ok = await adminUsersRepo.updateActive(userId, value);
  if (!ok) throw new ApiError(404, "User not found");

  const user = await adminUsersRepo.findById(userId);
  return user;
};

module.exports = { listUsers, getUser, updateRole, updateActive };
