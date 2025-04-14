import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetRole: string;
  location: string;
  seniority: string;
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
      profileUrl: string;
      location: string;
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
  githubSearchResults?: {
    contacts: Array<{
      name: string;
      role: string;
      company: string;
      location: string;
      selected: boolean;
      profilePicture: string;
      githubUrl: string;
      contributions: number;
      repositories: number;
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
  emailTemplate?: string;
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
  seniority: { type: String, required: true },
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
      selected: { type: Boolean, default: false },
      profilePicture: String,
      profileUrl: String,
      location: String
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
  },
  githubSearchResults: {
    contacts: [{
      name: String,
      role: String,
      company: String,
      location: String,
      selected: Boolean,
      profilePicture: String,
      githubUrl: String,
      contributions: Number,
      repositories: Number
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
  },
  emailTemplate: String
}, {
  timestamps: true
});

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema); 