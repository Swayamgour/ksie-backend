import mongoose from 'mongoose';

const securityAuditLogSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true }, // e.g. screening_alarm, unauthorized_access
    referenceType: { type: String },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    description: { type: String },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedStatus: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

export const SecurityAuditLog = mongoose.model('SecurityAuditLog', securityAuditLogSchema);
