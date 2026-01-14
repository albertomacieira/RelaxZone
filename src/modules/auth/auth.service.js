const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepo = require("./auth.repo");
const usersRepo = require("../users/users.repo");
const ApiError = require("../../utils/apiError");
const { ROLES, TOKEN_EXPIRATION } = require("../../config/constants");

const accessSecret = () => process.env.JWT_SECRET;
const refreshSecret = () => process.env.REFRESH_TOKEN_SECRET;

const generateTokens = (payload) => ({
  accessToken: jwt.sign(payload, accessSecret(), { expiresIn: TOKEN_EXPIRATION.ACCESS }),
  refreshToken: jwt.sign(payload, refreshSecret(), { expiresIn: TOKEN_EXPIRATION.REFRESH }),
});

const register = async ({ name, email, phone, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, "Missing registration data");
  }

  const existing = await authRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(409, "Email already exists");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await authRepo.createUser({
    name,
    email,
    phone,
    password_hash,
    role: ROLES.CLIENT,
  });

  const tokens = generateTokens({ id: user.id, role: user.role, email: user.email });
  return { user: usersRepo.toPublic(user), tokens };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Missing credentials");
  }

  const user = await authRepo.findByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");
  if (user.is_active === 0) throw new ApiError(403, "User inactive");

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) throw new ApiError(401, "Invalid credentials");

  const tokens = generateTokens({ id: user.id, role: user.role, email: user.email });
  return { user: usersRepo.toPublic(user), tokens };
};

const verifyAccessToken = (token) => jwt.verify(token, accessSecret());
const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret());

const refreshToken = async (tokenValue) => {
  if (!tokenValue) throw new ApiError(400, "Missing refresh token");

  const payload = verifyRefreshToken(tokenValue);
  const user = await authRepo.findById(payload.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.is_active === 0) throw new ApiError(403, "User inactive");

  const tokens = generateTokens({ id: user.id, role: user.role, email: user.email });
  return { user: usersRepo.toPublic(user), tokens };
};

module.exports = { register, login, refreshToken, verifyAccessToken };

