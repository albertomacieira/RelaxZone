const ApiError = require('../utils/apiError');

const validateBody = (fields = []) => (req, res, next) => {
  const payload = req.body || {};
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');

  if (missing.length) {
    return next(new ApiError(400, `Missing fields: ${missing.join(', ')}`));
  }

  return next();
};

module.exports = { validateBody };
