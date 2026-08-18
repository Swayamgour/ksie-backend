import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = broadcast
    channel: { type: String, enum: ['email', 'sms', 'whatsapp', 'in_app'], required: true },
    title: { type: String },
    message: { type: String, required: true },
    referenceType: { type: String },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, enum: ['queued', 'sent', 'failed', 'read'], default: 'queued' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
