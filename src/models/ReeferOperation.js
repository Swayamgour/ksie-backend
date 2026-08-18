import mongoose from 'mongoose';

const reeferOperationSchema = new mongoose.Schema(
  {
    containerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Container', required: true },
    plugInLocation: { type: String },
    plugInAt: { type: Date },
    plugOutAt: { type: Date },
    setTemperatureC: { type: Number },
    currentTemperatureC: { type: Number },
    humidityPercent: { type: Number },
    monitoringStatus: { type: String, enum: ['normal', 'alert', 'critical'], default: 'normal' },
    lastCheckedAt: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const ReeferOperation = mongoose.model('ReeferOperation', reeferOperationSchema);
