import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String },
    type: { type: String, enum: ['air_cargo', 'sea_cargo', 'general', 'cold_storage'], default: 'general' },
    totalCapacitySqft: { type: Number },
    usedCapacitySqft: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Warehouse = mongoose.model('Warehouse', warehouseSchema);
