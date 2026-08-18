import { Warehouse, WarehouseRack, CargoStorage } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/* -------------------- Warehouse -------------------- */
const warehouseBase = createCrudController(Warehouse, {
  searchFields: ['name', 'code', 'location'],
  filterFields: ['type', 'isActive'],
  entityName: 'Warehouse',
});
export const listWarehouses = warehouseBase.getAll;
export const getWarehouse = warehouseBase.getOne;
export const createWarehouse = warehouseBase.create;
export const updateWarehouse = warehouseBase.update;
export const deleteWarehouse = warehouseBase.remove;

/* -------------------- Rack / Bin -------------------- */
const rackBase = createCrudController(WarehouseRack, {
  filterFields: ['warehouseId', 'status'],
  entityName: 'Warehouse Rack',
});
export const listRacks = rackBase.getAll;
export const getRack = rackBase.getOne;
export const createRack = rackBase.create;
export const updateRack = rackBase.update;
export const deleteRack = rackBase.remove;

/* -------------------- Cargo Storage / Inventory Control -------------------- */
const storageBase = createCrudController(CargoStorage, {
  filterFields: ['warehouseId', 'rackId', 'referenceType', 'referenceId', 'status', 'damageReported'],
  entityName: 'Cargo Storage Record',
});
export const listCargoStorage = storageBase.getAll;
export const getCargoStorage = storageBase.getOne;
export const storeCargo = storageBase.create;
export const updateCargoStorage = storageBase.update;

// Cargo Release: mark stored cargo as released and free rack capacity
export const releaseCargo = catchAsync(async (req, res) => {
  const record = await CargoStorage.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Cargo storage record not found');
  if (record.status === 'released') throw new ApiError(400, 'Cargo already released');

  record.status = 'released';
  record.releasedAt = new Date();
  await record.save();

  if (record.rackId) {
    const rack = await WarehouseRack.findById(record.rackId);
    if (rack) {
      rack.occupiedUnits = Math.max(0, rack.occupiedUnits - (record.pieces || 1));
      rack.status = rack.occupiedUnits === 0 ? 'empty' : 'partial';
      await rack.save();
    }
  }

  return sendResponse(res, 200, 'Cargo released successfully', record);
});

// Damage report for a stored cargo item
export const reportDamage = catchAsync(async (req, res) => {
  const record = await CargoStorage.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Cargo storage record not found');
  record.damageReported = true;
  record.damageDescription = req.body.damageDescription;
  await record.save();
  return sendResponse(res, 200, 'Damage reported', record);
});

// Cargo aging report — items still in storage beyond X days (default 7)
export const cargoAgingReport = catchAsync(async (req, res) => {
  const thresholdDays = parseInt(req.query.days, 10) || 7;
  const records = await CargoStorage.find({ status: 'stored' });
  const aged = records.filter((r) => r.agingDays >= thresholdDays);
  return sendResponse(res, 200, 'Cargo aging report generated', aged, { thresholdDays, count: aged.length });
});
