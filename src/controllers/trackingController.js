import { ShipmentTracking, AirShipment, Container, CourierShipment, Transshipment, Vehicle } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';

const base = createCrudController(ShipmentTracking, {
  filterFields: ['referenceType', 'referenceId', 'eventCode'],
  entityName: 'Tracking Event',
});
export const listTrackingEvents = base.getAll;
export const getTrackingEvent = base.getOne;

export const addTrackingEvent = catchAsync(async (req, res) => {
  const record = await ShipmentTracking.create({ ...req.body, recordedBy: req.user?.id });
  return sendResponse(res, 201, 'Tracking event recorded', record);
});

// Unified public tracking: accepts an AWB, container number, or courier tracking number
export const publicTrack = catchAsync(async (req, res) => {
  const { number } = req.params;

  const [awb, container, courier, transshipment, vehicle] = await Promise.all([
    AirShipment.findOne({ awbNumber: number }),
    Container.findOne({ containerNumber: number }),
    CourierShipment.findOne({ courierNumber: number }),
    Transshipment.findOne({ transferNumber: number }),
    Vehicle.findOne({ vehicleNumber: number }),
  ]);

  const match = awb || container || courier || transshipment || vehicle;
  if (!match) {
    return sendResponse(res, 404, 'No shipment found for this tracking number', null);
  }

  const referenceType = awb ? 'air_shipment' : container ? 'container' : courier ? 'courier_shipment' : transshipment ? 'transshipment' : 'vehicle';
  const events = await ShipmentTracking.find({ referenceType, referenceId: match._id }).sort({ eventTimestamp: 1 });

  return sendResponse(res, 200, 'Tracking information found', { shipment: match, referenceType, events });
});
