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
  Divider,
  Chip,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface Campaign {
  id: number;
  name: string;
  targetRole: string;
  status: 'active' | 'completed' | 'draft';
  connections: number;
  responses: number;
  startDate: string;
  endDate: string;
}

const campaigns: Campaign[] = [
  {
    id: 1,
    name: 'Tech Leaders Q1',
    targetRole: 'Engineering Managers',
    status: 'active',
    connections: 12,
    responses: 5,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
  },
  {
    id: 2,
    name: 'Product Designers',
    targetRole: 'Senior Designers',
    status: 'completed',
    connections: 8,
    responses: 3,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
  },
  {
    id: 3,
    name: 'Startup Founders',
    targetRole: 'Founders',
    status: 'draft',
    connections: 0,
    responses: 0,
    startDate: '2024-04-01',
    endDate: '2024-04-30',
  },
];

const Campaigns: React.FC = () => {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Campaigns</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/campaign-setup')}
        >
          Create New Campaign
        </Button>
      </Box>

      <Card>
        <CardContent>
          <List>
            {campaigns.map((campaign, index) => (
              <React.Fragment key={campaign.id}>
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
                          Connections: {campaign.connections} • Responses: {campaign.responses}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Period: {campaign.startDate} to {campaign.endDate}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    View Details
                  </Button>
                </ListItem>
                {index < campaigns.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Campaigns; 