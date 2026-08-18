import mongoose from 'mongoose';

const customsResponseSchema = new mongoose.Schema({
  declarationId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomsDeclaration', required: true },
  provider: { type: String, enum: ['icegate','gst','e_invoice','other'], required: true },
  requestReference: String,
  externalReference: String,
  status: { type: String, enum: ['accepted','rejected','pending','query','error'], required: true },
  responsePayload: mongoose.Schema.Types.Mixed,
  receivedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const CustomsResponse = mongoose.model('CustomsResponse', customsResponseSchema);
