import mongoose from 'mongoose';

const warehouseRackSchema = new mongoose.Schema(
  {
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    rackCode: { type: String, required: true },
    binCode: { type: String },
    capacityUnits: { type: Number, default: 0 },
    occupiedUnits: { type: Number, default: 0 },
    status: { type: String, enum: ['empty', 'partial', 'full', 'blocked'], default: 'empty' },
  },
  { timestamps: true }
);

export const WarehouseRack = mongoose.model('WarehouseRack', warehouseRackSchema);
