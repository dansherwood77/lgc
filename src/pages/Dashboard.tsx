import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useCampaign } from '../contexts/CampaignContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, loading, error } = useCampaign();

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip icon={<PendingIcon />} label="Active" color="primary" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />;
      case 'cancelled':
        return <Chip icon={<CancelIcon />} label="Cancelled" color="error" size="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  // Get recent campaigns (last 3)
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 3);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Recent Campaigns */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recent Campaigns</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigate('/campaigns')}
            >
              View All
            </Button>
          </Box>
          <List>
            {recentCampaigns.map((campaign, index) => (
              <React.Fragment key={campaign._id}>
                <ListItem>
                  <ListItemIcon>
                    <CampaignIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{campaign.name}</Typography>
                        {getStatusChip(campaign.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Target Role: {campaign.targetRole}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {campaign.location}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/campaigns/${campaign._id}`)}
                  >
                    View Details
                  </Button>
                </ListItem>
                {index < recentCampaigns.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Upcoming Meetings</Typography>
            <Button 
              variant="outlined" 
              size="small"
              disabled
            >
              View All
            </Button>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No upcoming meetings scheduled
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard; 