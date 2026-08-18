import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    paymentReference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['cash', 'cheque', 'neft', 'rtgs', 'upi', 'card', 'other'], required: true },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed', 'failed', 'refunded'], default: 'pending' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
