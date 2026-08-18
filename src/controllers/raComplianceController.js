import { RaCompliance } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

const base = createCrudController(RaCompliance, {
  searchFields: ['referenceNumber', 'awbNumber'],
  filterFields: ['agentType', 'auditStatus'],
  entityName: 'RA/RA3 Compliance Record',
});

export const listRaRecords = base.getAll;
export const getRaRecord = base.getOne;
export const updateRaRecord = base.update;
export const deleteRaRecord = base.remove;

export const createRaRecord = catchAsync(async (req, res) => {
  const record = await RaCompliance.create({
    ...req.body,
    referenceNumber: req.body.referenceNumber || generateRefNumber('RA'),
  });
  return sendResponse(res, 201, 'RA/RA3 compliance record created', record);
});

export const verifyRaRecord = catchAsync(async (req, res) => {
  const record = await RaCompliance.findById(req.params.id);
  if (!record) throw new ApiError(404, 'RA/RA3 record not found');
  record.auditStatus = req.body.auditStatus; // compliant | non_compliant
  record.verifiedBy = req.user?.id;
  record.verifiedAt = new Date();
  if (req.body.remarks) record.remarks = req.body.remarks;
  await record.save();
  return sendResponse(res, 200, 'RA/RA3 record verified', record);
});
