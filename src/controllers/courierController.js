import { CourierShipment } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

const base = createCrudController(CourierShipment, {
  searchFields: ['courierNumber', 'senderName', 'receiverName'],
  filterFields: ['shipmentType', 'status', 'Customer'],
  populate: [{ path: 'Customer', select: 'companyName' }],
  entityName: 'Courier Shipment',
});

export const listCouriers = base.getAll;
export const getCourier = base.getOne;
export const updateCourier = base.update;
export const deleteCourier = base.remove;

export const bookCourier = catchAsync(async (req, res) => {
  const record = await CourierShipment.create({
    ...req.body,
    courierNumber: req.body.courierNumber || generateRefNumber('CR'),
    bookedBy: req.user?.id,
    status: 'booked',
  });
  return sendResponse(res, 201, 'Courier booked successfully', record);
});

export const updateCourierStatus = catchAsync(async (req, res) => {
  const record = await CourierShipment.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Courier shipment not found');
  record.status = req.body.status;
  if (req.body.currentLocation) record.currentLocation = req.body.currentLocation;
  await record.save();
  return sendResponse(res, 200, 'Courier status updated', record);
});
