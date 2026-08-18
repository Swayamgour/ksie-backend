import { Notification } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const base = createCrudController(Notification, {
  filterFields: ['userId', 'channel', 'status', 'referenceType'],
  entityName: 'Notification',
});
export const listNotifications = base.getAll;
export const getNotification = base.getOne;

// Queues a notification. Actual SMS/Email/WhatsApp dispatch should be wired to
// a provider (e.g. Twilio, SES, WhatsApp Business API) via a background worker.
export const sendNotification = catchAsync(async (req, res) => {
  const record = await Notification.create({ ...req.body, status: 'queued' });
  // TODO: push to a queue (e.g. BullMQ/RabbitMQ) for actual delivery
  return sendResponse(res, 201, 'Notification queued for delivery', record);
});

export const markAsRead = catchAsync(async (req, res) => {
  const record = await Notification.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Notification not found');
  record.status = 'read';
  await record.save();
  return sendResponse(res, 200, 'Notification marked as read', record);
});
