import mongoose from 'mongoose';

const vesselSchema = new mongoose.Schema({
  vesselName: { type: String, required: true, trim: true },
  imoNumber: String,
  shippingLine: String,
  voyageNumber: String,
  portOfOrigin: String,
  portOfDestination: String,
  eta: Date,
  ata: Date,
  etd: Date,
  status: { type: String, enum: ['scheduled','arrived','berthed','departed','cancelled'], default: 'scheduled' },
}, { timestamps: true });

export const Vessel = mongoose.model('Vessel', vesselSchema);
