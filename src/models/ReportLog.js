import mongoose from 'mongoose';

const reportLogSchema = new mongoose.Schema(
  {
    reportType: { type: String, enum: ['cargo', 'revenue', 'security', 'customs', 'warehouse', 'kpi'], required: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileUrl: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ReportLog = mongoose.model('ReportLog', reportLogSchema);
