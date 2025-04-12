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
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  People,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
} from '@mui/icons-material';

// Types for our data
interface Campaign {
  id: number;
  name: string;
  targetRole: string;
  status: 'active' | 'completed' | 'draft';
  connections: number;
  responses: number;
}

interface Meeting {
  id: number;
  name: string;
  role: string;
  date: string;
  time: string;
  type: 'virtual' | 'coffee';
}

// Mock data for demonstration
const campaignStats = {
  totalConnections: 42,
  openRate: '68%',
  responseRate: '32%',
  scheduledMeetings: 15,
};

const recentCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Tech Leaders Q1',
    targetRole: 'Engineering Managers',
    status: 'active',
    connections: 12,
    responses: 5,
  },
  {
    id: 2,
    name: 'Product Designers',
    targetRole: 'Senior Designers',
    status: 'completed',
    connections: 8,
    responses: 3,
  },
  {
    id: 3,
    name: 'Startup Founders',
    targetRole: 'Founders',
    status: 'draft',
    connections: 0,
    responses: 0,
  },
];

const upcomingMeetings: Meeting[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Engineering Manager at Google',
    date: '2024-03-15',
    time: '10:00 AM',
    type: 'virtual',
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Product Designer at Airbnb',
    date: '2024-03-16',
    time: '2:30 PM',
    type: 'coffee',
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const getStatusChip = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return <Chip icon={<PendingIcon />} label="Active" color="primary" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />;
      case 'draft':
        return <Chip icon={<CancelIcon />} label="Draft" color="default" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Stats Section */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4,
        '& > *': {
          flex: '1 1 250px',
          minWidth: '250px'
        }
      }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Connections</Typography>
            </Box>
            <Typography variant="h4">24</Typography>
            <Typography color="textSecondary">+5 this week</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Open Rate</Typography>
            </Box>
            <Typography variant="h4">78%</Typography>
            <Typography color="textSecondary">+12% from last week</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Response Rate</Typography>
            </Box>
            <Typography variant="h4">45%</Typography>
            <Typography color="textSecondary">+8% from last week</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ScheduleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Scheduled Meetings</Typography>
            </Box>
            <Typography variant="h4">12</Typography>
            <Typography color="textSecondary">+3 this week</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Campaigns and Meetings Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3
      }}>
        <Box sx={{ flex: { md: 2 } }}>
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
                  <React.Fragment key={campaign.id}>
                    <ListItem>
                      <ListItemIcon>
                        <CampaignIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={campaign.name}
                        secondary={`${campaign.connections} connections • ${campaign.status}`}
                      />
                    </ListItem>
                    {index < recentCampaigns.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { md: 1 } }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Upcoming Meetings</Typography>
                <Button variant="outlined" size="small" onClick={() => navigate('/meetings')}>
                  View All
                </Button>
              </Box>
              <List>
                {upcomingMeetings.map((meeting, index) => (
                  <React.Fragment key={meeting.id}>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={meeting.name}
                        secondary={`${meeting.date} • ${meeting.time}`}
                      />
                    </ListItem>
                    {index < upcomingMeetings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 