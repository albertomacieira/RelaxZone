const usersRepo = require('./users.repo');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');

const listUsers = async () => {
  const users = await usersRepo.list();
  return users.map(usersRepo.toPublic);
};

const getProfile = async (userId) => {
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await usersRepo.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return usersRepo.toPublic(user);
};

const updateRole = async (userId, role) => {
  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  try {
    const updated = await usersRepo.updateRole(userId, role);
    return usersRepo.toPublic(updated);
  } catch (error) {
    throw new ApiError(404, error.message || 'User not found');
  }
};

module.exports = { listUsers, getProfile, updateRole };
