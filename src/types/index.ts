export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  linkedinEmail?: string;
  linkedinPassword?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICampaign {
  _id?: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetRole: string;
  location: string;
  outreachType: string;
  createdBy: string;
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
  emailTemplate?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 