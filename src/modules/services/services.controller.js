const servicesService = require('./services.service');

const listServices = async (req, res, next) => {
  try {
    const services = await servicesService.listServices();
    res.json(services);
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
    const service = await servicesService.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
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

module.exports = { listServices, getService, createService, updateService, removeService };
