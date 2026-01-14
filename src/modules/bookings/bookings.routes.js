const router = require('express').Router();
const bookingsController = require('./bookings.controller');
const { authenticate } = require('../../middlewares/auth');
const { requireAdmin } = require('../../middlewares/roles');
const { validateBody } = require('../../middlewares/validate');

// CLIENTE: ver as minhas reservas
router.get('/my', authenticate, bookingsController.listMyBookings);

// ADMIN: ver todas
router.get('/', authenticate, requireAdmin, bookingsController.listBookings);

// CLIENTE: criar reserva (alinhado com BD)
router.post(
  '/',
  authenticate,
  validateBody(['service_id', 'start_at']),
  bookingsController.createBooking
);

// (Opcional) CLIENTE: cancelar
router.patch('/:bookingId/cancel', authenticate, bookingsController.cancelBooking);

// ADMIN: aprovar/cancelar via status
router.patch(
  '/:bookingId/status',
  authenticate,
  requireAdmin,
  validateBody(['status']),
  bookingsController.updateStatus
);

module.exports = router;
