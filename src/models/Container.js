import mongoose from 'mongoose';

const containerSchema = new mongoose.Schema(
  {
    containerNumber: { type: String, required: true, unique: true },
    shipmentType: { type: String, enum: ['import', 'export'], required: true },
    Customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    containerSize: { type: String, enum: ['20ft', '40ft', '40ft_hc', '45ft'], required: true },
    containerType: { type: String, enum: ['dry', 'reefer', 'open_top', 'flat_rack', 'tank'], default: 'dry' },
    vesselName: { type: String },
    voyageNumber: { type: String },
    billOfLading: { type: String },
    sealNumber: { type: String },
    grossWeightKg: { type: Number },

    status: {
      type: String,
      enum: [
        // export
        'cargo_in', 'customs_examination', 'stuffed', 'sf_filed', 'sealed', 'leo_granted', 'gate_out',
        // import
        'arrival_manifest', 'igm_filed', 'vessel_arrived', 'landed', 'boe_filed', 'examination',
        'stripped', 'ooc_granted', 'delivery_order_issued', 'delivered',
      ],
      required: true,
      default: 'cargo_in',
    },
    currentLocation: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const Container = mongoose.model('Container', containerSchema);
