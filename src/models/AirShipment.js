import mongoose from 'mongoose';

const airShipmentSchema = new mongoose.Schema(
  {
    shipmentType: { type: String, enum: ['import', 'export'], required: true },
    awbNumber: { type: String, required: true, unique: true },
    // Kept capitalized to match the frontend's `.Customer` population access pattern
    Customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    originAirport: { type: String },
    destinationAirport: { type: String },
    airlineCode: { type: String },
    flightNumber: { type: String },
    pieces: { type: Number },
    grossWeightKg: { type: Number },
    chargeableWeightKg: { type: Number },
    natureOfGoods: { type: String },
    isDangerousGoods: { type: Boolean, default: false },

    status: {
      type: String,
      enum: [
        // import stages
        'awb_created', 'manifest_uploaded', 'cargo_arrived', 'customs_processing',
        'in_storage', 'cargo_released', 'out_for_delivery', 'delivered',
        // export stages
        'booking_created', 'cargo_accepted', 'security_screened', 'customs_cleared',
        'uld_allocated', 'flight_loaded', 'departed',
      ],
      required: true,
      default: 'awb_created',
    },

    ulwNumber: { type: String }, // ULD allocation
    securityScreeningStatus: { type: String, enum: ['pending', 'passed', 'failed', 'not_required'], default: 'pending' },
    customsStatus: { type: String, enum: ['pending', 'in_process', 'cleared', 'held'], default: 'pending' },
    remarks: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const AirShipment = mongoose.model('AirShipment', airShipmentSchema);
