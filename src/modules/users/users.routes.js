const router = require('express').Router();
const usersController = require('./users.controller');
const { authenticate } = require('../../middlewares/auth');
const { requireAdmin } = require('../../middlewares/roles');
const { validateBody } = require('../../middlewares/validate');

router.get('/', authenticate, requireAdmin, usersController.listUsers);
router.get('/me', authenticate, usersController.getProfile);
router.patch('/:userId/role', authenticate, requireAdmin, validateBody(['role']), usersController.updateRole);

module.exports = router;
