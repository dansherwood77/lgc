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
  status: 'draft' | 'active' | 'paused' | 'completed';
  linkedinSearchResults?: {
    contacts: Array<{
      name: string;
      role: string;
      company: string;
      selected: boolean;
      profilePicture: string;
    }>;
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    searchParams: {
      location: string;
      targetRole: string;
      seniority: string;
    };
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
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
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  linkedinSearchResults: {
    contacts: [{
      name: String,
      role: String,
      company: String,
      selected: Boolean,
      profilePicture: String
    }],
    total: Number,
    currentPage: Number,
    pageSize: Number,
    totalPages: Number,
    searchParams: {
      location: String,
      targetRole: String,
      seniority: String
    },
    lastUpdated: Date
  }
}, {
  timestamps: true
});

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema); 