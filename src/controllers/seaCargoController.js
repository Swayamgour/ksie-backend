import { Container, GateOperation, Weighment, ContainerStuffing, ReeferOperation } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

/* -------------------- Containers (Import / Export workflow) -------------------- */
const containerBase = createCrudController(Container, {
  searchFields: ['containerNumber', 'billOfLading', 'vesselName'],
  filterFields: ['shipmentType', 'status', 'containerType', 'Customer'],
  populate: [{ path: 'Customer', select: 'companyName' }],
  entityName: 'Container',
});
export const listContainers = containerBase.getAll;
export const getContainer = containerBase.getOne;
export const createContainer = containerBase.create;
export const deleteContainer = containerBase.remove;

const EXPORT_CONTAINER_FLOW = ['cargo_in', 'customs_examination', 'stuffed', 'sf_filed', 'sealed', 'leo_granted', 'gate_out'];
const IMPORT_CONTAINER_FLOW = ['arrival_manifest', 'igm_filed', 'vessel_arrived', 'landed', 'boe_filed', 'examination', 'stripped', 'ooc_granted', 'delivery_order_issued', 'delivered'];

export const updateContainerStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const container = await Container.findById(req.params.id);
  if (!container) throw new ApiError(404, 'Container not found');

  const flow = container.shipmentType === 'export' ? EXPORT_CONTAINER_FLOW : IMPORT_CONTAINER_FLOW;
  if (!flow.includes(status)) {
    throw new ApiError(400, `Invalid status '${status}' for a ${container.shipmentType} container`);
  }

  container.status = status;
  if (req.body.currentLocation) container.currentLocation = req.body.currentLocation;
  if (req.body.remarks) container.remarks = req.body.remarks;
  await container.save();

  return sendResponse(res, 200, 'Container status updated', container);
});

export const trackByContainerNumber = catchAsync(async (req, res) => {
  const container = await Container.findOne({ containerNumber: req.params.containerNumber });
  if (!container) throw new ApiError(404, 'No container found with this number');
  return sendResponse(res, 200, 'Container found', container);
});

/* -------------------- Vehicle Gate Process -------------------- */
const gateBase = createCrudController(GateOperation, {
  filterFields: ['containerId', 'gateType', 'securityClearance'],
  entityName: 'Gate Operation',
});
export const listGateOperations = gateBase.getAll;
export const getGateOperation = gateBase.getOne;

export const recordGateOperation = catchAsync(async (req, res) => {
  const record = await GateOperation.create({ ...req.body, operatedBy: req.user?.id });

  if (record.containerId) {
    const container = await Container.findById(record.containerId);
    if (container) {
      container.status = record.gateType === 'gate_out' ? 'gate_out' : container.status;
      await container.save();
    }
  }

  return sendResponse(res, 201, `Vehicle ${record.gateType === 'gate_in' ? 'gate-in' : 'gate-out'} recorded`, record);
});

export const clearSecurity = catchAsync(async (req, res) => {
  const record = await GateOperation.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Gate operation record not found');
  record.securityClearance = req.body.securityClearance; // cleared | held
  await record.save();
  return sendResponse(res, 200, 'Security clearance updated', record);
});

/* -------------------- Weighment -------------------- */
const weighmentBase = createCrudController(Weighment, {
  filterFields: ['containerId'],
  entityName: 'Weighment Record',
});
export const listWeighments = weighmentBase.getAll;
export const getWeighment = weighmentBase.getOne;
export const recordWeighment = weighmentBase.create;

/* -------------------- Export Container Stuffing -------------------- */
const stuffingBase = createCrudController(ContainerStuffing, {
  filterFields: ['containerId', 'status'],
  entityName: 'Container Stuffing Record',
});
export const listStuffingRecords = stuffingBase.getAll;
export const getStuffingRecord = stuffingBase.getOne;
export const updateStuffingRecord = stuffingBase.update;

export const startStuffing = catchAsync(async (req, res) => {
  const record = await ContainerStuffing.create({ ...req.body, supervisedBy: req.user?.id, status: 'in_progress' });
  return sendResponse(res, 201, 'Container stuffing started', record);
});

export const fileSfMessage = catchAsync(async (req, res) => {
  const record = await ContainerStuffing.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Stuffing record not found');
  record.sfMessageFiled = true;
  record.sfMessageRef = generateRefNumber('SF');
  await record.save();
  return sendResponse(res, 200, 'SF message filed', record);
});

export const sealContainer = catchAsync(async (req, res) => {
  const record = await ContainerStuffing.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Stuffing record not found');
  record.status = 'sealed';
  record.sealNumber = req.body.sealNumber;
  await record.save();

  const container = await Container.findById(record.containerId);
  if (container) {
    container.status = 'sealed';
    container.sealNumber = req.body.sealNumber;
    await container.save();
  }

  return sendResponse(res, 200, 'Container sealed', record);
});

/* -------------------- Reefer Container Management -------------------- */
const reeferBase = createCrudController(ReeferOperation, {
  filterFields: ['containerId', 'monitoringStatus'],
  entityName: 'Reefer Operation Record',
});
export const listReeferOperations = reeferBase.getAll;
export const getReeferOperation = reeferBase.getOne;
export const createReeferOperation = reeferBase.create;

export const updateReeferMonitoring = catchAsync(async (req, res) => {
  const record = await ReeferOperation.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Reefer operation record not found');

  record.currentTemperatureC = req.body.currentTemperatureC ?? record.currentTemperatureC;
  record.humidityPercent = req.body.humidityPercent ?? record.humidityPercent;
  record.lastCheckedAt = new Date();

  const deviation = Math.abs((record.currentTemperatureC ?? 0) - (record.setTemperatureC ?? 0));
  record.monitoringStatus = deviation > 3 ? 'critical' : deviation > 1 ? 'alert' : 'normal';

  await record.save();
  return sendResponse(res, 200, 'Reefer monitoring reading recorded', record);
});
