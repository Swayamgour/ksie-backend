import { Transshipment } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

const base = createCrudController(Transshipment, {
  searchFields: ['transferNumber', 'awbNumber'],
  filterFields: ['status', 'transitAirport'],
  entityName: 'Transshipment',
});

export const listTransshipments = base.getAll;
export const getTransshipment = base.getOne;
export const updateTransshipment = base.update;
export const deleteTransshipment = base.remove;

export const createTransshipment = catchAsync(async (req, res) => {
  const record = await Transshipment.create({
    ...req.body,
    transferNumber: req.body.transferNumber || generateRefNumber('TRS'),
    status: 'transferred_in',
  });
  return sendResponse(res, 201, 'Transshipment record created', record);
});
