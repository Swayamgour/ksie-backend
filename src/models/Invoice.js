import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    // Kept capitalized to match the frontend's `.Customer.companyName` access pattern
    Customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    referenceType: { type: String, enum: ['air_shipment', 'container', 'courier_shipment'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    lineItems: { type: [mongoose.Schema.Types.Mixed], default: [] }, // [{chargeCode, description, qty, rate, amount, gstPercent, gstAmount}]
    subTotal: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    eInvoiceIrn: { type: String }, // GST e-invoice IRN
    eInvoiceStatus: { type: String, enum: ['not_generated', 'generated', 'cancelled'], default: 'not_generated' },
    status: { type: String, enum: ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'], default: 'draft' },
    dueDate: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
