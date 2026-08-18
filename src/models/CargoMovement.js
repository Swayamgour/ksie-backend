import mongoose from 'mongoose';

const cargoMovementSchema = new mongoose.Schema({
  referenceType: { type: String, enum: ['air_shipment','container','courier_shipment'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fromLocation: String,
  toLocation: String,
  movementType: { type: String, enum: ['received','moved','stored','released','loaded','unloaded','gate_in','gate_out','other'], required: true },
  pieces: Number,
  weightKg: Number,
  remarks: String,
  movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const CargoMovement = mongoose.model('CargoMovement', cargoMovementSchema);
