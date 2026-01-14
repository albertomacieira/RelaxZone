const router = require('express').Router();
const authController = require('./auth.controller');
const { validateBody } = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

router.post('/register', validateBody(['name', 'email', 'password']), authController.register);
router.post('/login', validateBody(['email', 'password']), authController.login);
router.post('/refresh', validateBody(['refreshToken']), authController.refresh);

router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);

module.exports = router;

