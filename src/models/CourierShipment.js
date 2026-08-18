import mongoose from 'mongoose';

const courierShipmentSchema = new mongoose.Schema(
  {
    courierNumber: { type: String, required: true, unique: true },
    Customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    shipmentType: { type: String, enum: ['import', 'export'], required: true },
    senderName: { type: String },
    receiverName: { type: String },
    originCountry: { type: String },
    destinationCountry: { type: String },
    weightKg: { type: Number },
    natureOfGoods: { type: String },
    declaredValue: { type: Number },
    status: {
      type: String,
      enum: ['booked', 'customs_processing', 'customs_cleared', 'out_for_delivery', 'delivered', 'returned'],
      default: 'booked',
    },
    currentLocation: { type: String },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const CourierShipment = mongoose.model('CourierShipment', courierShipmentSchema);
