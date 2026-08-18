import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // super_admin, operations_manager, customs_officer, ...
    description: { type: String },
    permissions: { type: [String], default: [] }, // e.g. ["air:read","air:write","billing:*"]
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Role = mongoose.model('Role', roleSchema);
