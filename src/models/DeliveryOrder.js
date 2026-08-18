import mongoose from 'mongoose';

const deliveryOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  referenceType: { type: String, enum: ['air_shipment','container','courier_shipment'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  Customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  issuedTo: String,
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft','approved','issued','used','cancelled'], default: 'draft' },
  issuedAt: Date,
  expiresAt: Date,
  remarks: String,
}, { timestamps: true });

export const DeliveryOrder = mongoose.model('DeliveryOrder', deliveryOrderSchema);
