const authService = require('./auth.service');
const ApiError = require("../../utils/apiError");
const authRepo = require("./auth.repo");
const usersRepo = require("../users/users.repo");

const register = async (req, res, next) => {
  try {
    const payload = await authService.register(req.body);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = await authService.login(req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const payload = await authService.refreshToken(req.body.refreshToken);
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    // req.user vem do middleware authenticate
    const user = await authRepo.findById(req.user.id);
    if (!user) throw new ApiError(404, "User not found");

    res.json({ user: usersRepo.toPublic(user) });
  } catch (error) {
    next(error);
  }
};


const logout = async (req, res, next) => {
  try {

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, me, logout }
