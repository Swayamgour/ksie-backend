import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    gstNumber: { type: String },
    panNumber: { type: String },
    iecCode: { type: String }, // Import Export Code
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    customerType: {
      type: String,
      enum: ['importer', 'exporter', 'freight_forwarder', 'airline', 'other'],
      default: 'other',
    },
    creditLimit: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Customer = mongoose.model('Customer', customerSchema);
