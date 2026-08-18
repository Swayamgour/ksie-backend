import mongoose from 'mongoose';

const weighmentSchema = new mongoose.Schema(
  {
    containerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Container', required: true },
    vehicleNumber: { type: String },
    grossWeightKg: { type: Number, required: true },
    tareWeightKg: { type: Number },
    weighbridgeId: { type: String },
    weighedAt: { type: Date, default: Date.now },
    weighedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

weighmentSchema.virtual('netWeightKg').get(function () {
  return this.grossWeightKg != null && this.tareWeightKg != null ? this.grossWeightKg - this.tareWeightKg : null;
});

export const Weighment = mongoose.model('Weighment', weighmentSchema);
