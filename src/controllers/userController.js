import { User } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const base = createCrudController(User, {
  searchFields: ['fullName', 'email'],
  filterFields: ['Role', 'department', 'isActive'],
  populate: ['Role'],
  entityName: 'User',
});

// Registration handled in authController.register (keeps password-hash flow in one place)
export const getAllUsers = base.getAll;
export const getUser = base.getOne;
export const updateUser = base.update;
export const deleteUser = base.remove;

export const toggleUserStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = !user.isActive;
  await user.save();
  return sendResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user);
});
