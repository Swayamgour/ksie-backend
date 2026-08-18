import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  vehicleType: { type: String, enum: ['truck','trailer','van','other'], default: 'truck' },
  driverName: String,
  driverPhone: String,
  transporterName: String,
  gpsDeviceId: String,
  status: { type: String, enum: ['available','inside','outside','blocked','inactive'], default: 'available' },
  lastLatitude: Number,
  lastLongitude: Number,
  lastLocation: String,
  lastTrackedAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
