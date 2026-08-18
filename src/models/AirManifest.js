import mongoose from 'mongoose';

const airManifestSchema = new mongoose.Schema(
  {
    manifestNumber: { type: String, required: true, unique: true },
    flightNumber: { type: String, required: true },
    flightDate: { type: Date, required: true },
    airlineCode: { type: String },
    originAirport: { type: String },
    destinationAirport: { type: String },
    totalAwbCount: { type: Number, default: 0 },
    totalPieces: { type: Number, default: 0 },
    totalWeightKg: { type: Number, default: 0 },
    fileUrl: { type: String }, // uploaded manifest document
    status: { type: String, enum: ['uploaded', 'validated', 'processed', 'rejected'], default: 'uploaded' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const AirManifest = mongoose.model('AirManifest', airManifestSchema);
