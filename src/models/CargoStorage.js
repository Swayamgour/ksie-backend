import mongoose from 'mongoose';

const cargoStorageSchema = new mongoose.Schema(
  {
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    rackId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarehouseRack' },
    referenceType: { type: String, enum: ['air_shipment', 'container', 'courier_shipment'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    pieces: { type: Number },
    weightKg: { type: Number },
    storedAt: { type: Date, default: Date.now },
    releasedAt: { type: Date },
    damageReported: { type: Boolean, default: false },
    damageDescription: { type: String },
    status: { type: String, enum: ['stored', 'released'], default: 'stored' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Mirrors the old Sequelize VIRTUAL: days the cargo has been (or was) in storage
cargoStorageSchema.virtual('agingDays').get(function () {
  const start = this.storedAt;
  const end = this.releasedAt || new Date();
  if (!start) return 0;
  return Math.floor((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
});

export const CargoStorage = mongoose.model('CargoStorage', cargoStorageSchema);
