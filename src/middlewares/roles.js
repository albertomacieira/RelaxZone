const ApiError = require('../utils/apiError');
const { ROLES } = require('../config/constants');

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return next(new ApiError(403, 'Forbidden'));
  }

  return next();
};

const requireAdmin = requireRole(ROLES.ADMIN);

module.exports = { requireRole, requireAdmin };
