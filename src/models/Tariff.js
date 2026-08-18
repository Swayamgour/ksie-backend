import mongoose from 'mongoose';

const tariffSchema = new mongoose.Schema(
  {
    chargeCode: { type: String, required: true, unique: true },
    chargeName: { type: String, required: true },
    chargeCategory: { type: String, enum: ['import', 'export', 'storage', 'handling', 'security', 'other'], required: true },
    unit: { type: String, enum: ['per_kg', 'per_awb', 'per_container', 'per_day', 'flat'], default: 'flat' },
    rate: { type: Number, required: true },
    gstPercent: { type: Number, default: 18.0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Tariff = mongoose.model('Tariff', tariffSchema);
