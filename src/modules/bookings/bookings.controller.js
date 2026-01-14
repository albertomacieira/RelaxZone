const bookingsService = require("./bookings.service");

const listBookings = async (req, res, next) => {
  try {
    const bookings = await bookingsService.listBookings({
      userId: undefined,
      isAdmin: true,
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const listMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingsService.listBookings({
      userId: req.user.id,
      isAdmin: false,
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    // aceita snake_case (alinhado com BD) e camelCase (compatibilidade)
    const service_id = req.body.service_id ?? req.body.serviceId;
    const start_at = req.body.start_at ?? req.body.scheduledAt;

    const booking = await bookingsService.createBooking({
      userId: req.user.id,
      service_id,
      start_at,
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const booking = await bookingsService.updateStatus(
      req.params.bookingId,
      req.body.status
    );
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingsService.cancelBooking({
      bookingId: req.params.bookingId,
      userId: req.user.id,
      isAdmin: req.user.role === "ADMIN",
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBookings,
  listMyBookings,
  createBooking,
  updateStatus,
  cancelBooking, 
};

