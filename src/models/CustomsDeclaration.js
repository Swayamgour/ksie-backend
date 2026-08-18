import mongoose from 'mongoose';

const customsDeclarationSchema = new mongoose.Schema(
  {
    declarationType: { type: String, enum: ['bill_of_entry', 'shipping_bill', 'igm', 'sf_message'], required: true },
    declarationNumber: { type: String, required: true, unique: true },
    referenceType: { type: String, enum: ['air_shipment', 'container', 'courier_shipment'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    icegateReferenceId: { type: String }, // ICEGATE API tracking id
    filingStatus: {
      type: String,
      enum: ['draft', 'filed', 'query_raised', 'assessed', 'ooc_granted', 'leo_granted', 'rejected'],
      default: 'draft',
    },
    icegateResponse: { type: mongoose.Schema.Types.Mixed },
    filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    filedAt: { type: Date },
  },
  { timestamps: true }
);

export const CustomsDeclaration = mongoose.model('CustomsDeclaration', customsDeclarationSchema);
