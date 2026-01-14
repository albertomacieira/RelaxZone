const router = require('express').Router();
const servicesController = require('./services.controller');
const { authenticate } = require('../../middlewares/auth');
const { requireAdmin } = require('../../middlewares/roles');
const { validateBody } = require('../../middlewares/validate');

router.get('/', servicesController.listServices);
router.get('/:serviceId', servicesController.getService);
router.post('/', authenticate, requireAdmin, validateBody(['name', 'duration_min', 'price_cents']), servicesController.createService);
router.patch('/:serviceId', authenticate, requireAdmin, servicesController.updateService);
router.delete('/:serviceId', authenticate, requireAdmin, servicesController.removeService);

module.exports = router;
