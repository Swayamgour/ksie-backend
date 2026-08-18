import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  module: { type: String, required: true },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
