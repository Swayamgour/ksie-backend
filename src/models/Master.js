import mongoose from 'mongoose';

// Generic key-value master collection used for Airport Master, Cargo Type Master,
// Container Master, Tariff Category etc. that don't need their own collection.
const masterSchema = new mongoose.Schema(
  {
    masterType: { type: String, enum: ['airport', 'cargo_type', 'container_type', 'tariff_category', 'currency'], required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    extra: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

masterSchema.index({ masterType: 1, code: 1 }, { unique: true });

export const Master = mongoose.model('Master', masterSchema);
