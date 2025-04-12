import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetRole: string;
  location: string;
  outreachType: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

const CampaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  targetRole: { type: String, required: true },
  location: { type: String, required: true },
  outreachType: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema); 