import mongoose from 'mongoose';

const uldAllocationSchema = new mongoose.Schema({
  allocationNumber: { type: String, required: true, unique: true },
  airShipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AirShipment', required: true },
  uldNumber: { type: String, required: true },
  uldType: String,
  position: String,
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allocatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['allocated','loaded','released','cancelled'], default: 'allocated' },
}, { timestamps: true });

export const UldAllocation = mongoose.model('UldAllocation', uldAllocationSchema);
