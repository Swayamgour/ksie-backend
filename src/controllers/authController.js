import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';

const signAccessToken = (user) =>
  jwt.sign({ id: user.id, roleId: user.Role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

// Admin/HR creates a new system user (Operations/Customs/Billing/Security staff etc.)
export const register = catchAsync(async (req, res) => {
  const { fullName, email, phone, password, roleId, department } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const role = await Role.findById(roleId);
  if (!role) throw new ApiError(400, 'Invalid roleId supplied');

  const user = await User.create({
    fullName,
    email,
    phone,
    passwordHash: password, // hashed via pre-save hook
    Role: roleId,
    department,
  });

  return sendResponse(res, 201, 'User registered successfully', user);
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash').populate('Role');

  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const safeUser = user.toObject();
  delete safeUser.passwordHash;

  return sendResponse(res, 200, 'Login successful', {
    user: safeUser,
    accessToken,
    refreshToken,
  });
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new ApiError(400, 'Refresh token is required');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User not found or inactive');

  const accessToken = signAccessToken(user);
  return sendResponse(res, 200, 'Token refreshed', { accessToken });
});

export const me = catchAsync(async (req, res) => {
  return sendResponse(res, 200, 'Current user fetched', req.user);
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+passwordHash');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  user.passwordHash = newPassword; // hashed via pre-save hook
  await user.save();

  return sendResponse(res, 200, 'Password changed successfully');
});
