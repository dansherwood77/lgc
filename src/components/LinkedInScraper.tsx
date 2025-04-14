import React, { useState } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';

interface LinkedInScraperProps {
  campaignId: string;
}

const LinkedInScraper: React.FC<LinkedInScraperProps> = ({ campaignId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  const searchLinkedIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchStatus('Starting LinkedIn search...');

      // Get campaign details to extract search parameters
      const campaignResponse = await fetch(`http://localhost:5001/api/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign details');
      }

      const campaign = await campaignResponse.json();
      const { targetRole, location, seniority } = campaign;

      setSearchStatus('Searching LinkedIn profiles...');

      // Search LinkedIn profiles
      const searchResponse = await fetch('http://localhost:5001/api/linkedin/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetRole, location, seniority })
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || 'Failed to search LinkedIn');
      }

      const { profiles } = await searchResponse.json();
      setSearchStatus(`Found ${profiles.length} profiles`);

      // Update campaign with search results
      const updateResponse = await fetch('http://localhost:5001/api/linkedin/update-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          campaignId,
          profiles,
          searchParams: { targetRole, location, seniority }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update campaign with search results');
      }

      setSearchStatus('Search completed successfully');
    } catch (err) {
      console.error('LinkedIn search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search LinkedIn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={searchLinkedIn}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Search LinkedIn'}
      </Button>

      {searchStatus && (
        <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
          {searchStatus}
        </Typography>
      )}

      {error && (
        <Typography variant="body1" color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default LinkedInScraper; 