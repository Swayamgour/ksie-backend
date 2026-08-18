import mongoose from 'mongoose';

const gateOperationSchema = new mongoose.Schema(
  {
    containerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Container' },
    vehicleNumber: { type: String, required: true },
    driverName: { type: String },
    driverLicense: { type: String },
    gateType: { type: String, enum: ['gate_in', 'gate_out'], required: true },
    gateTimestamp: { type: Date, default: Date.now },
    securityClearance: { type: String, enum: ['pending', 'cleared', 'held'], default: 'pending' },
    remarks: { type: String },
    operatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const GateOperation = mongoose.model('GateOperation', gateOperationSchema);
