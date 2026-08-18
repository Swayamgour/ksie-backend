import { SecurityScreening, SecurityAuditLog } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/* -------------------- Security Screening (X-Ray / ETD integration) -------------------- */
const screeningBase = createCrudController(SecurityScreening, {
  filterFields: ['referenceType', 'referenceId', 'screeningMethod', 'result'],
  entityName: 'Security Screening',
});
export const listScreenings = screeningBase.getAll;
export const getScreening = screeningBase.getOne;
export const createScreening = screeningBase.create;
export const updateScreening = screeningBase.update;

// Simulates receiving a result from an X-Ray / ETD device integration
export const recordScreeningResult = catchAsync(async (req, res) => {
  const record = await SecurityScreening.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Screening record not found');
  record.result = req.body.result; // cleared | alarm | rejected
  record.deviceId = req.body.deviceId || record.deviceId;
  record.screenedBy = req.user?.id;
  record.screenedAt = new Date();
  await record.save();

  if (record.result === 'alarm') {
    await SecurityAuditLog.create({
      eventType: 'screening_alarm',
      referenceType: record.referenceType,
      referenceId: record.referenceId,
      severity: 'high',
      description: `Screening alarm triggered on device ${record.deviceId || 'N/A'}`,
      raisedBy: req.user?.id,
    });
  }

  return sendResponse(res, 200, 'Screening result recorded', record);
});

export const approveScreening = catchAsync(async (req, res) => {
  const record = await SecurityScreening.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Screening record not found');
  if (record.result !== 'cleared') throw new ApiError(400, 'Only cleared screenings can be approved');
  record.approvedBy = req.user?.id;
  record.approvedAt = new Date();
  await record.save();
  return sendResponse(res, 200, 'Screening approved', record);
});

/* -------------------- Security Audit Logs / Compliance -------------------- */
const auditBase = createCrudController(SecurityAuditLog, {
  filterFields: ['eventType', 'severity', 'resolvedStatus'],
  entityName: 'Security Audit Log',
});
export const listAuditLogs = auditBase.getAll;
export const getAuditLog = auditBase.getOne;
export const createAuditLog = auditBase.create;
export const updateAuditLog = auditBase.update;

export const securityDashboard = catchAsync(async (req, res) => {
  const [pendingScreenings, alarms, openIncidents] = await Promise.all([
    SecurityScreening.countDocuments({ result: 'pending' }),
    SecurityScreening.countDocuments({ result: 'alarm' }),
    SecurityAuditLog.countDocuments({ resolvedStatus: 'open' }),
  ]);
  return sendResponse(res, 200, 'Security dashboard data', { pendingScreenings, alarms, openIncidents });
});
