import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your campaigns and connections
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CampaignIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Campaigns</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Create and manage your outreach campaigns
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/campaign-setup')}
              >
                Create Campaign
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Connections</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View and manage your professional connections
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/rolodex')}
              >
                View Connections
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Meetings</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Schedule and manage your coffee meetings
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/meetings')}
              >
                View Meetings
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 