import mongoose from 'mongoose';

const flightLoadingSchema = new mongoose.Schema({
  loadingNumber: { type: String, required: true, unique: true },
  airShipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AirShipment', required: true },
  flightNumber: String,
  airlineCode: String,
  loadingPosition: String,
  loadedPieces: Number,
  loadedWeightKg: Number,
  loadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  loadedAt: Date,
  status: { type: String, enum: ['planned','loaded','removed','cancelled'], default: 'planned' },
  remarks: String,
}, { timestamps: true });

export const FlightLoading = mongoose.model('FlightLoading', flightLoadingSchema);
