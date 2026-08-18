import mongoose from 'mongoose';

const containerStuffingSchema = new mongoose.Schema(
  {
    containerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Container', required: true },
    stuffingLocation: { type: String },
    supervisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cargoDescription: { type: String },
    totalPackages: { type: Number },
    sfMessageFiled: { type: Boolean, default: false },
    sfMessageRef: { type: String },
    sealNumber: { type: String },
    stuffedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['in_progress', 'completed', 'sealed'], default: 'in_progress' },
  },
  { timestamps: true }
);

export const ContainerStuffing = mongoose.model('ContainerStuffing', containerStuffingSchema);
