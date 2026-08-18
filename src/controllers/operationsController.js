import { Vehicle, Vessel, DeliveryOrder, UldAllocation, FlightLoading, CargoMovement, AuditLog, AirShipment } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

export const listVehicles = createCrudController(Vehicle, { searchFields: ['vehicleNumber','driverName','transporterName'], filterFields: ['status','vehicleType'], entityName: 'Vehicle' }).getAll;
export const getVehicle = createCrudController(Vehicle, { entityName: 'Vehicle' }).getOne;
export const createVehicle = createCrudController(Vehicle, { entityName: 'Vehicle' }).create;
export const updateVehicle = createCrudController(Vehicle, { entityName: 'Vehicle' }).update;

export const trackVehicle = catchAsync(async (req,res) => {
  const vehicle = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  vehicle.lastLatitude = req.body.latitude ?? vehicle.lastLatitude;
  vehicle.lastLongitude = req.body.longitude ?? vehicle.lastLongitude;
  vehicle.lastLocation = req.body.location ?? vehicle.lastLocation;
  vehicle.lastTrackedAt = new Date();
  await vehicle.save();
  return sendResponse(res,200,'Vehicle location updated',vehicle);
});

export const listVessels = createCrudController(Vessel, { searchFields: ['vesselName','imoNumber','voyageNumber'], filterFields: ['status'], entityName: 'Vessel' }).getAll;
export const getVessel = createCrudController(Vessel, { entityName: 'Vessel' }).getOne;
export const createVessel = createCrudController(Vessel, { entityName: 'Vessel' }).create;
export const updateVessel = createCrudController(Vessel, { entityName: 'Vessel' }).update;

export const listDeliveryOrders = createCrudController(DeliveryOrder, { filterFields: ['referenceType','referenceId','status','Customer'], entityName: 'Delivery Order' }).getAll;
export const getDeliveryOrder = createCrudController(DeliveryOrder, { entityName: 'Delivery Order' }).getOne;
export const createDeliveryOrder = catchAsync(async (req,res) => {
  const order = await DeliveryOrder.create({ ...req.body, orderNumber: req.body.orderNumber || generateRefNumber('DO'), issuedBy: req.user?.id });
  return sendResponse(res,201,'Delivery order created',order);
});
export const approveDeliveryOrder = catchAsync(async (req,res) => {
  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) throw new ApiError(404,'Delivery order not found');
  order.status='approved'; await order.save();
  return sendResponse(res,200,'Delivery order approved',order);
});
export const issueDeliveryOrder = catchAsync(async (req,res) => {
  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) throw new ApiError(404,'Delivery order not found');
  order.status='issued'; order.issuedAt=new Date(); await order.save();
  return sendResponse(res,200,'Delivery order issued',order);
});

export const listUldAllocations = createCrudController(UldAllocation, { filterFields: ['airShipmentId','status','uldNumber'], entityName: 'ULD Allocation' }).getAll;
export const allocateUld = catchAsync(async (req,res) => {
  const shipment = await AirShipment.findById(req.body.airShipmentId);
  if (!shipment) throw new ApiError(404,'Air shipment not found');
  const allocation = await UldAllocation.create({ ...req.body, allocationNumber: req.body.allocationNumber || generateRefNumber('ULD'), allocatedBy: req.user?.id });
  shipment.ulwNumber = req.body.uldNumber; shipment.status='uld_allocated'; await shipment.save();
  return sendResponse(res,201,'ULD allocated',allocation);
});

export const listFlightLoading = createCrudController(FlightLoading, { filterFields: ['airShipmentId','status','flightNumber'], entityName: 'Flight Loading' }).getAll;
export const loadFlight = catchAsync(async (req,res) => {
  const shipment = await AirShipment.findById(req.body.airShipmentId);
  if (!shipment) throw new ApiError(404,'Air shipment not found');
  const loading = await FlightLoading.create({ ...req.body, loadingNumber: req.body.loadingNumber || generateRefNumber('LOAD'), loadedBy: req.user?.id, loadedAt: new Date(), status:'loaded' });
  shipment.status='flight_loaded'; await shipment.save();
  return sendResponse(res,201,'Flight loading recorded',loading);
});

export const listCargoMovements = createCrudController(CargoMovement, { filterFields: ['referenceType','referenceId','movementType'], entityName: 'Cargo Movement' }).getAll;
export const recordCargoMovement = createCrudController(CargoMovement, { entityName: 'Cargo Movement' }).create;

export const listAuditLogs = createCrudController(AuditLog, { filterFields: ['module','action','userId','entityType'], entityName: 'Audit Log' }).getAll;
