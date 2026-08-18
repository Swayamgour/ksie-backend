import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/index.js';

export const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. Please provide a valid token.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token.');
  }

  const user = await User.findById(decoded.id).populate('Role');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User no longer exists or is inactive.');
  }

  req.user = user;
  next();
});
