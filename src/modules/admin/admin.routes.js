const router = require("express").Router();

const adminUsersController = require("./admin.users.controller");
const { authenticate } = require("../../middlewares/auth");
const { requireAdmin } = require("../../middlewares/roles");
const { validateBody } = require("../../middlewares/validate");

// tudo aqui é ADMIN-only
router.get("/users", authenticate, requireAdmin, adminUsersController.listUsers);

router.get(
  "/users/:userId",
  authenticate,
  requireAdmin,
  adminUsersController.getUser
);

router.patch(
  "/users/:userId/role",
  authenticate,
  requireAdmin,
  validateBody(["role"]),
  adminUsersController.updateRole
);

router.patch(
  "/users/:userId/active",
  authenticate,
  requireAdmin,
  validateBody(["is_active"]),
  adminUsersController.updateActive
);

module.exports = router;


