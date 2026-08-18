import mongoose from 'mongoose';

const shipmentTrackingSchema = new mongoose.Schema(
  {
    referenceType: { type: String, enum: ['air_shipment', 'container', 'courier_shipment', 'transshipment', 'vehicle'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    eventCode: { type: String, required: true }, // e.g. GATE_IN, CUSTOMS_CLEARED, OUT_FOR_DELIVERY
    eventDescription: { type: String },
    location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    eventTimestamp: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ShipmentTracking = mongoose.model('ShipmentTracking', shipmentTrackingSchema);
