const adminUsersService = require("./admin.users.service");

const listUsers = async (req, res, next) => {
  try {
    const users = await adminUsersService.listUsers({
      q: req.query.q,
      role: req.query.role,
      is_active: req.query.is_active,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.json(users);
  } catch (e) {
    next(e);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await adminUsersService.getUser(req.params.userId);
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const user = await adminUsersService.updateRole(req.params.userId, req.body.role);
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

const updateActive = async (req, res, next) => {
  try {
    const user = await adminUsersService.updateActive(req.params.userId, req.body.is_active);
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

module.exports = { listUsers, getUser, updateRole, updateActive };
