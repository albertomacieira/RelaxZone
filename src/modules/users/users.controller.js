const usersService = require('./users.service');

const listUsers = async (req, res, next) => {
  try {
    const users = await usersService.listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await usersService.getProfile(req.user?.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const updated = await usersService.updateRole(req.params.userId, req.body.role);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, getProfile, updateRole };
