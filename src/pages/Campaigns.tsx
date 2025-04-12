import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
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
  const [campaignsList, setCampaignsList] = useState<Campaign[]>(campaigns);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

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

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (campaignToDelete) {
      setCampaignsList(campaignsList.filter(campaign => campaign.id !== campaignToDelete.id));
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
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
            {campaignsList.map((campaign, index) => (
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    >
                      View Details
                    </Button>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(campaign)}
                      sx={{ 
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'white'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < campaignsList.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the campaign "{campaignToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Campaigns; 