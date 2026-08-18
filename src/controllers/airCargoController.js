import { AirShipment } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

const base = createCrudController(AirShipment, {
  searchFields: ['awbNumber', 'natureOfGoods'],
  filterFields: ['shipmentType', 'status', 'Customer', 'securityScreeningStatus', 'customsStatus'],
  populate: [{ path: 'Customer', select: 'companyName' }],
  entityName: 'Air Shipment',
});

export const listAirShipments = base.getAll;
export const getAirShipment = base.getOne;
export const deleteAirShipment = base.remove;

// Import workflow: Air Way Bill Entry
export const createImportAwb = catchAsync(async (req, res) => {
  const record = await AirShipment.create({
    ...req.body,
    shipmentType: 'import',
    awbNumber: req.body.awbNumber || generateRefNumber('AWB'),
    status: 'awb_created',
    createdBy: req.user?.id,
  });
  return sendResponse(res, 201, 'Import AWB created successfully', record);
});

// Export workflow: Shipment Booking
export const createExportBooking = catchAsync(async (req, res) => {
  const record = await AirShipment.create({
    ...req.body,
    shipmentType: 'export',
    awbNumber: req.body.awbNumber || generateRefNumber('AWB'),
    status: 'booking_created',
    createdBy: req.user?.id,
  });
  return sendResponse(res, 201, 'Export booking created successfully', record);
});

const IMPORT_FLOW = ['awb_created', 'manifest_uploaded', 'cargo_arrived', 'customs_processing', 'in_storage', 'cargo_released', 'out_for_delivery', 'delivered'];
const EXPORT_FLOW = ['booking_created', 'cargo_accepted', 'security_screened', 'customs_cleared', 'uld_allocated', 'flight_loaded', 'departed'];

// Moves shipment to next / specific stage in its workflow (Cargo Arrival, Customs Processing,
// Cargo Storage, Cargo Release, Delivery, Security Screening, ULD Allocation, Flight Loading, etc.)
export const updateShipmentStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const shipment = await AirShipment.findById(req.params.id);
  if (!shipment) throw new ApiError(404, 'Air shipment not found');

  const flow = shipment.shipmentType === 'import' ? IMPORT_FLOW : EXPORT_FLOW;
  if (!flow.includes(status)) {
    throw new ApiError(400, `Invalid status '${status}' for a ${shipment.shipmentType} shipment`);
  }

  shipment.status = status;
  if (req.body.remarks) shipment.remarks = req.body.remarks;
  await shipment.save();

  return sendResponse(res, 200, 'Shipment status updated', shipment);
});

export const trackByAwb = catchAsync(async (req, res) => {
  const shipment = await AirShipment.findOne({ awbNumber: req.params.awbNumber });
  if (!shipment) throw new ApiError(404, 'No shipment found for this AWB number');
  return sendResponse(res, 200, 'Shipment found', shipment);
});
