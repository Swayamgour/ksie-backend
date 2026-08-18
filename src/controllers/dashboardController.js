import {
  AirShipment, CourierShipment, CargoStorage, Invoice, CustomsDeclaration,
  GateOperation, SecurityAuditLog, SecurityScreening, Container,
} from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';

// Powers the Management Dashboard screen: Total Shipments, Import/Export/Courier Cargo,
// Warehouse Stock, Revenue, Pending Customs Clearance, Vehicle Movements, Security Alerts.
export const getDashboardSummary = catchAsync(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalAirShipments,
    importCargo,
    exportCargo,
    courierCargo,
    warehouseStock,
    pendingCustoms,
    vehicleMovementsToday,
    securityAlerts,
    invoices,
    totalContainers,
  ] = await Promise.all([
    AirShipment.countDocuments(),
    AirShipment.countDocuments({ shipmentType: 'import' }),
    AirShipment.countDocuments({ shipmentType: 'export' }),
    CourierShipment.countDocuments(),
    CargoStorage.countDocuments({ status: 'stored' }),
    CustomsDeclaration.countDocuments({ filingStatus: { $in: ['draft', 'filed', 'query_raised'] } }),
    GateOperation.countDocuments({ gateTimestamp: { $gte: todayStart } }),
    SecurityAuditLog.countDocuments({ resolvedStatus: 'open' }),
    Invoice.find({}, 'totalAmount status'),
    Container.countDocuments(),
  ]);

  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const pendingScreenings = await SecurityScreening.countDocuments({ result: 'pending' });

  return sendResponse(res, 200, 'Dashboard summary fetched', {
    totalShipments: totalAirShipments + courierCargo + totalContainers,
    importCargo,
    exportCargo,
    courierCargo,
    warehouseStock,
    revenue: totalRevenue.toFixed(2),
    pendingCustomsClearance: pendingCustoms,
    vehicleMovementsToday,
    securityAlerts,
    pendingScreenings,
    totalContainers,
  });
});
