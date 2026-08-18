import { ReportLog, AirShipment, Container, CourierShipment, Invoice, SecurityAuditLog, CustomsDeclaration } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';

const base = createCrudController(ReportLog, {
  filterFields: ['reportType'],
  entityName: 'Report',
});
export const listReportLogs = base.getAll;
export const getReportLog = base.getOne;

// Generates an on-the-fly MIS report snapshot and logs the generation event.
// fileUrl generation (PDF/Excel export) can be wired to a queue/worker in production.
export const generateReport = catchAsync(async (req, res) => {
  const { reportType, filters = {} } = req.body;
  let data = {};

  switch (reportType) {
    case 'cargo': {
      const [airCount, containerCount, courierCount] = await Promise.all([
        AirShipment.countDocuments(),
        Container.countDocuments(),
        CourierShipment.countDocuments(),
      ]);
      data = { airShipments: airCount, containers: containerCount, courierShipments: courierCount };
      break;
    }
    case 'revenue': {
      const invoices = await Invoice.find();
      data = {
        totalBilled: invoices.reduce((s, i) => s + Number(i.totalAmount), 0).toFixed(2),
        totalPaid: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.totalAmount), 0).toFixed(2),
        invoiceCount: invoices.length,
      };
      break;
    }
    case 'security': {
      data = { openAuditLogs: await SecurityAuditLog.countDocuments({ resolvedStatus: 'open' }) };
      break;
    }
    case 'customs': {
      const [filed, cleared, held] = await Promise.all([
        CustomsDeclaration.countDocuments({ filingStatus: 'filed' }),
        CustomsDeclaration.countDocuments({ filingStatus: 'assessed' }),
        CustomsDeclaration.countDocuments({ filingStatus: 'query_raised' }),
      ]);
      data = { filed, cleared, held };
      break;
    }
    default:
      data = { message: `Report type '${reportType}' snapshot not yet implemented in this scaffold` };
  }

  const log = await ReportLog.create({ reportType, filters, generatedBy: req.user?.id });

  return sendResponse(res, 200, 'Report generated', { log, data });
});
