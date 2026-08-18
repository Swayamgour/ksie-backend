import { Tariff, Invoice, Payment } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

/* -------------------- Tariff Management -------------------- */
const tariffBase = createCrudController(Tariff, {
  searchFields: ['chargeCode', 'chargeName'],
  filterFields: ['chargeCategory', 'isActive'],
  entityName: 'Tariff',
});
export const listTariffs = tariffBase.getAll;
export const getTariff = tariffBase.getOne;
export const createTariff = tariffBase.create;
export const updateTariff = tariffBase.update;
export const deleteTariff = tariffBase.remove;

/* -------------------- GST Billing / Invoices -------------------- */
const invoiceBase = createCrudController(Invoice, {
  searchFields: ['invoiceNumber'],
  filterFields: ['Customer', 'referenceType', 'referenceId', 'status'],
  populate: [{ path: 'Customer', select: 'companyName gstNumber' }],
  entityName: 'Invoice',
});
export const listInvoices = invoiceBase.getAll;
export const getInvoice = invoiceBase.getOne;
export const deleteInvoice = invoiceBase.remove;

// Generates an invoice from a list of { chargeCode, qty } items looked up against the Tariff master,
// auto-calculating GST per line item and the invoice totals.
export const generateInvoice = catchAsync(async (req, res) => {
  const { customerId, referenceType, referenceId, items, dueDate } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'At least one billing item (chargeCode + qty) is required');
  }

  const chargeCodes = items.map((i) => i.chargeCode);
  const tariffs = await Tariff.find({ chargeCode: { $in: chargeCodes }, isActive: true });
  const tariffMap = new Map(tariffs.map((t) => [t.chargeCode, t]));

  let subTotal = 0;
  let totalGst = 0;
  const lineItems = items.map((item) => {
    const tariff = tariffMap.get(item.chargeCode);
    if (!tariff) throw new ApiError(400, `Unknown or inactive charge code: ${item.chargeCode}`);

    const qty = Number(item.qty) || 1;
    const amount = Number(tariff.rate) * qty;
    const gstAmount = Number(((amount * Number(tariff.gstPercent)) / 100).toFixed(2));

    subTotal += amount;
    totalGst += gstAmount;

    return {
      chargeCode: tariff.chargeCode,
      description: tariff.chargeName,
      unit: tariff.unit,
      qty,
      rate: Number(tariff.rate),
      amount,
      gstPercent: Number(tariff.gstPercent),
      gstAmount,
    };
  });

  const invoice = await Invoice.create({
    invoiceNumber: generateRefNumber('INV'),
    Customer: customerId,
    referenceType,
    referenceId,
    lineItems,
    subTotal: subTotal.toFixed(2),
    totalGst: totalGst.toFixed(2),
    totalAmount: (subTotal + totalGst).toFixed(2),
    status: 'issued',
    dueDate,
    generatedBy: req.user?.id,
  });

  return sendResponse(res, 201, 'Invoice generated successfully', invoice);
});

// GST e-invoice stub — wire to actual GST e-invoice/IRP API in production
export const generateEInvoice = catchAsync(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.eInvoiceStatus === 'generated') throw new ApiError(400, 'E-Invoice already generated');

  invoice.eInvoiceIrn = generateRefNumber('IRN');
  invoice.eInvoiceStatus = 'generated';
  await invoice.save();

  return sendResponse(res, 200, 'E-Invoice generated successfully', invoice);
});

/* -------------------- Payment Tracking -------------------- */
const paymentBase = createCrudController(Payment, {
  filterFields: ['invoiceId', 'paymentMode', 'status'],
  entityName: 'Payment',
});
export const listPayments = paymentBase.getAll;
export const getPayment = paymentBase.getOne;

export const recordPayment = catchAsync(async (req, res) => {
  const invoice = await Invoice.findById(req.body.invoiceId);
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const payment = await Payment.create({
    ...req.body,
    paymentReference: req.body.paymentReference || generateRefNumber('PAY'),
    recordedBy: req.user?.id,
    status: 'confirmed',
  });

  const confirmedPayments = await Payment.find({ invoiceId: invoice._id, status: 'confirmed' });
  const paidSoFar = confirmedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  invoice.status = paidSoFar >= Number(invoice.totalAmount) ? 'paid' : 'partially_paid';
  await invoice.save();

  return sendResponse(res, 201, 'Payment recorded successfully', payment);
});

/* -------------------- Revenue / Receivables -------------------- */
export const revenueSummary = catchAsync(async (req, res) => {
  const invoices = await Invoice.find();
  const totalBilled = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalOutstanding = totalBilled - totalPaid;

  return sendResponse(res, 200, 'Revenue summary generated', {
    totalBilled: totalBilled.toFixed(2),
    totalPaid: totalPaid.toFixed(2),
    totalOutstanding: totalOutstanding.toFixed(2),
    invoiceCount: invoices.length,
  });
});
