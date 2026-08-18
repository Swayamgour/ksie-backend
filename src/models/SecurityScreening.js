import mongoose from 'mongoose';

const securityScreeningSchema = new mongoose.Schema(
  {
    referenceType: { type: String, enum: ['air_shipment', 'courier_shipment', 'container'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    screeningMethod: { type: String, enum: ['xray', 'etd', 'physical', 'canine'], required: true },
    deviceId: { type: String }, // X-Ray / ETD device integration reference
    result: { type: String, enum: ['pending', 'cleared', 'alarm', 'rejected'], default: 'pending' },
    screenedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    screenedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const SecurityScreening = mongoose.model('SecurityScreening', securityScreeningSchema);
