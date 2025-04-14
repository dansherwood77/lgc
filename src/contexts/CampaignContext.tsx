import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetRole: string;
  location: string;
  outreachType: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
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
    lastUpdated: string;
  };
}

interface CampaignContextType {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  createCampaign: (campaign: Omit<Campaign, '_id' | 'createdBy' | 'status'>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  getCampaign: (id: string) => Promise<Campaign | null>;
}

const API_URL = 'http://localhost:5001/api';

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        throw new Error('Not authenticated');
      }

      console.log('Fetching campaigns with token:', token.substring(0, 10) + '...');
      const response = await fetch(`${API_URL}/campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Campaign fetch error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Campaign fetch error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaign: Omit<Campaign, '_id' | 'createdBy' | 'status'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const newCampaign = await response.json();
      setCampaigns(prev => [...prev, newCampaign]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }

      const updatedCampaign = await response.json();
      setCampaigns(prev =>
        prev.map(campaign => (campaign._id === id ? updatedCampaign : campaign))
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      setCampaigns(prev => prev.filter(campaign => campaign._id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    }
  };

  const getCampaign = async (id: string): Promise<Campaign | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }

      return await response.json();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      return null;
    }
  };

  const value = {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaign,
  };

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}; 