import mongoose from 'mongoose';

const customsDocumentSchema = new mongoose.Schema(
  {
    declarationId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomsDeclaration', required: true },
    documentType: { type: String, required: true }, // invoice, packing list, COO, license, etc.
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export const CustomsDocument = mongoose.model('CustomsDocument', customsDocumentSchema);
