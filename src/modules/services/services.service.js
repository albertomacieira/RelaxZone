const repo = require('./services.repo');
const ApiError = require('../../utils/apiError');

function normalizeCreate(body) {
  const name = String(body.name || '').trim();
  if (!name) throw new ApiError(400, 'Missing service name');

  const duration_min = Number(body.duration_min ?? body.duration);
  if (!Number.isFinite(duration_min) || duration_min <= 0) {
    throw new ApiError(400, 'Invalid duration (use duration or duration_min)');
  }

  let price_cents;
  if (body.price_cents !== undefined) {
    price_cents = Number(body.price_cents);
  } else {
    const price = Number(body.price); // euros
    if (!Number.isFinite(price)) throw new ApiError(400, 'Invalid price (use price or price_cents)');
    price_cents = Math.round(price * 100);
  }

  if (!Number.isFinite(price_cents) || price_cents < 0) {
    throw new ApiError(400, 'Invalid price');
  }

  return {
    name,
    description: body.description ?? null,
    duration_min,
    price_cents,
    image_url: body.image_url ?? null,
  };
}

function normalizePatch(body) {
  const patch = {};

  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.description !== undefined) patch.description = body.description;
  if (body.image_url !== undefined) patch.image_url = body.image_url;

  if (body.duration !== undefined || body.duration_min !== undefined) {
    const duration_min = Number(body.duration_min ?? body.duration);
    if (!Number.isFinite(duration_min) || duration_min <= 0) {
      throw new ApiError(400, 'Invalid duration');
    }
    patch.duration_min = duration_min;
  }

  if (body.price !== undefined || body.price_cents !== undefined) {
    const price_cents = body.price_cents !== undefined
      ? Number(body.price_cents)
      : Math.round(Number(body.price) * 100);

    if (!Number.isFinite(price_cents) || price_cents < 0) {
      throw new ApiError(400, 'Invalid price');
    }
    patch.price_cents = price_cents;
  }

  if (body.is_active !== undefined) patch.is_active = Number(body.is_active) ? 1 : 0;

  return patch;
}

const listServices = async () => repo.listActive();

const getService = async (serviceId) => {
  const id = Number(serviceId);
  if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid serviceId');

  const service = await repo.findById(id);
  if (!service || service.is_active === 0) throw new ApiError(404, 'Service not found');

  return service;
};

const createService = async (body) => {
  const data = normalizeCreate(body);
  return repo.create(data);
};

const updateService = async (serviceId, body) => {
  const id = Number(serviceId);
  if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid serviceId');

  const existing = await repo.findById(id);
  if (!existing) throw new ApiError(404, 'Service not found');

  const patch = normalizePatch(body);
  if (Object.keys(patch).length === 0) throw new ApiError(400, 'No fields to update');

  return repo.update(id, patch);
};

const removeService = async (serviceId) => {
  const id = Number(serviceId);
  if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid serviceId');

  const existing = await repo.findById(id);
  if (!existing) throw new ApiError(404, 'Service not found');

  await repo.softDelete(id);
};

module.exports = { listServices, getService, createService, updateService, removeService };


