const servicesService = require('./services.service');

const listServices = async (req, res, next) => {
  try {
    const services = await servicesService.listServices();
    res.json(services);
  } catch (error) {
    next(error);
  }
};

const listPopular = async (req, res, next) => {
  try {
    const services = await servicesService.listPopular(req.query.limit);
    // normaliza BigInt devolvido pelo driver
    const safe = JSON.parse(
      JSON.stringify(services, (_k, v) => (typeof v === "bigint" ? Number(v) : v))
    );
    res.json(safe);
  } catch (error) {
    next(error);
  }
};

const getService = async (req, res, next) => {
  try {
    const service = await servicesService.getService(req.params.serviceId);
    res.json(service);
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image_url = `/uploads/services/${req.file.filename}`;
    }
    const service = await servicesService.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image_url = `/uploads/services/${req.file.filename}`;
    }
    const service = await servicesService.updateService(req.params.serviceId, req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
};

const removeService = async (req, res, next) => {
  try {
    await servicesService.removeService(req.params.serviceId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = { listServices, listPopular, getService, createService, updateService, removeService };
