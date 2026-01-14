const bookingsRepo = require("./bookings.repo");
const servicesRepo = require("../services/services.repo");
const ApiError = require("../../utils/apiError");
const dateUtils = require("../../utils/date");
const { BOOKING_MIN_LEAD_MINUTES } = require("../../config/constants");
const { BOOKING_CANCEL_MIN_LEAD_MINUTES } = require("../../config/constants");


const ALLOWED_STATUSES = ["PENDING", "APPROVED", "CANCELLED"];

const listBookings = async ({ userId, isAdmin }) => {
  if (isAdmin) return bookingsRepo.list();
  if (!userId) throw new ApiError(401, "Not authenticated");
  return bookingsRepo.list({ userId });
};

function parseDateSafe(value) {
  const d = dateUtils?.parseISO ? dateUtils.parseISO(value) : new Date(value);
  if (!d || Number.isNaN(d.getTime())) return null;
  return d;
}

const createBooking = async (payload) => {
  const userId = payload.userId;

  // aceita camelCase e snake_case
  const serviceId = payload.serviceId ?? payload.service_id;
  const scheduledAt = payload.scheduledAt ?? payload.start_at;

  if (!userId) throw new ApiError(401, "Not authenticated");
  if (!serviceId || !scheduledAt) throw new ApiError(400, "Missing booking data");

  const service = await servicesRepo.findById(serviceId);
  if (!service) throw new ApiError(404, "Service not found");

  // duração pode vir como duration_min (BD) ou duration (código antigo)
  const durationMin = Number(service.duration_min ?? service.duration ?? service.durationMin);
  if (!durationMin || Number.isNaN(durationMin)) {
    throw new ApiError(500, "Service duration is invalid");
  }

  const start = parseDateSafe(scheduledAt);
  if (!start) throw new ApiError(400, "Invalid date");

  // Não permitir reservas no passado
  const now = new Date();
  if (start.getTime() < now.getTime()) {
  throw new ApiError(400, "Não é possível reservar no passado");
  }

  // Mínimo de antecedência (ex.: 60 min)
  const minLeadMs = (BOOKING_MIN_LEAD_MINUTES ?? 60) * 60 * 1000;
  if (start.getTime() < Date.now() + minLeadMs) {
  throw new ApiError(
    400,
    `A reserva tem de ser feita com pelo menos ${BOOKING_MIN_LEAD_MINUTES ?? 60} minutos de antecedência`
  );
  }

  const end = new Date(start.getTime() + durationMin * 60 * 1000);

  const overlap = await bookingsRepo.existsOverlapForUser({
  userId,
  startAt: start,
  endAt: end,
  });

  if (overlap) {
  throw new ApiError(409, "Já tens uma reserva nesse horário");
  }

  return bookingsRepo.create({
    userId,
    serviceId: Number(serviceId),
    startAt: start,
    endAt: end,
    status: "PENDING",
  });
};

const updateStatus = async (bookingId, status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  try {
    return await bookingsRepo.updateStatus(bookingId, status);
  } catch (error) {
    throw new ApiError(404, error.message || "Booking not found");
  }
};

const cancelBooking = async ({ bookingId, userId, isAdmin }) => {
  if (!userId) throw new ApiError(401, "Not authenticated");

  const booking = await bookingsRepo.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  // Só o dono ou ADMIN pode cancelar
  if (!isAdmin && Number(booking.user_id) !== Number(userId)) {
    throw new ApiError(403, "Forbidden");
  }

  // Se já estiver cancelada, devolve como está (idempotente)
  if (booking.status === "CANCELLED") return booking;

  // Regra: não cancelar se já começou / ou se faltar menos de X minutos
  const start = new Date(booking.start_at);
  if (Number.isNaN(start.getTime())) {
    throw new ApiError(500, "Invalid booking start_at");
  }

  const minLeadMs = (BOOKING_CANCEL_MIN_LEAD_MINUTES ?? 30) * 60 * 1000;

  if (start.getTime() < Date.now()) {
    throw new ApiError(400, "Não é possível cancelar uma reserva que já começou");
  }

  if (start.getTime() < Date.now() + minLeadMs) {
    throw new ApiError(
      400,
      `Só é possível cancelar com pelo menos ${BOOKING_CANCEL_MIN_LEAD_MINUTES ?? 30} minutos de antecedência`
    );
  }

  // Cancelar -> status CANCELLED
  return bookingsRepo.updateStatus(bookingId, "CANCELLED");
};


module.exports = { listBookings, createBooking, updateStatus, cancelBooking };
