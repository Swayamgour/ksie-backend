import { AirManifest } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

const base = createCrudController(AirManifest, {
  searchFields: ['manifestNumber', 'flightNumber'],
  filterFields: ['status', 'airlineCode'],
  entityName: 'Air Manifest',
});

export const listManifests = base.getAll;
export const getManifest = base.getOne;
export const updateManifest = base.update;
export const deleteManifest = base.remove;

export const uploadManifest = catchAsync(async (req, res) => {
  const record = await AirManifest.create({
    ...req.body,
    manifestNumber: req.body.manifestNumber || generateRefNumber('MNF'),
    uploadedBy: req.user?.id,
    status: 'uploaded',
  });
  return sendResponse(res, 201, 'Manifest uploaded successfully', record);
});
