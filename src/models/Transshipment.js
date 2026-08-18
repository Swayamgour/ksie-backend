import mongoose from 'mongoose';

const transshipmentSchema = new mongoose.Schema(
  {
    transferNumber: { type: String, required: true, unique: true },
    awbNumber: { type: String },
    originAirport: { type: String },
    transitAirport: { type: String },
    destinationAirport: { type: String },
    inboundFlight: { type: String },
    outboundFlight: { type: String },
    pieces: { type: Number },
    weightKg: { type: Number },
    status: { type: String, enum: ['transferred_in', 'in_transit', 'transferred_out', 'completed'], default: 'transferred_in' },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const Transshipment = mongoose.model('Transshipment', transshipmentSchema);
