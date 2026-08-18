import mongoose from 'mongoose';

const raComplianceSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, required: true, unique: true },
    awbNumber: { type: String },
    agentType: { type: String, enum: ['RA', 'RA3', 'KC', 'ACC3'], required: true },
    screeningMethod: { type: String }, // X-ray, ETD, physical
    documentUrl: { type: String },
    auditStatus: { type: String, enum: ['pending', 'compliant', 'non_compliant'], default: 'pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const RaCompliance = mongoose.model('RaCompliance', raComplianceSchema);
