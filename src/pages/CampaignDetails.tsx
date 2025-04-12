import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useCampaign } from '../contexts/CampaignContext';

interface User {
  id: number;
  name: string;
  role: string;
  company: string;
  status: 'responded' | 'scheduled' | 'no_response';
  meetingDate?: string;
}

type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCampaign, updateCampaign, deleteCampaign } = useCampaign();
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        if (!id) return;
        const data = await getCampaign(id);
        if (data) {
          setCampaign(data);
        } else {
          setError('Campaign not found');
        }
      } catch (err) {
        setError('Failed to fetch campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, getCampaign]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status: User['status']) => {
    switch (status) {
      case 'responded':
        return <Chip icon={<CheckCircleIcon />} label="Responded" color="success" size="small" />;
      case 'scheduled':
        return <Chip icon={<EventIcon />} label="Meeting Scheduled" color="primary" size="small" />;
      case 'no_response':
        return <Chip icon={<PendingIcon />} label="No Response" color="default" size="small" />;
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;
      await deleteCampaign(id);
      navigate('/campaigns');
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  const handleStatusUpdate = async (newStatus: CampaignStatus) => {
    try {
      if (!id) return;
      await updateCampaign(id, { status: newStatus });
      setCampaign((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Failed to update campaign status');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !campaign) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error || 'Campaign not found'}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">{campaign.name}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">Description</Typography>
              <Typography>{campaign.description}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">Target Role</Typography>
                <Typography>{campaign.targetRole}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">Location</Typography>
                <Typography>{campaign.location}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">Outreach Type</Typography>
                <Typography>{campaign.outreachType}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">Date Created</Typography>
                <Typography>{new Date(campaign.startDate).toLocaleDateString()}</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Responded" />
          <Tab label="Scheduled" />
          <Tab label="No Response" />
        </Tabs>
      </Box>

      <Card>
        <CardContent>
          <List>
            {campaign.contacts?.map((contact: any, index: number) => (
              <React.Fragment key={contact.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>{contact.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{contact.name}</Typography>
                        {getStatusChip(contact.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {contact.role} at {contact.company}
                        </Typography>
                        {contact.meetingDate && (
                          <Typography variant="body2" color="text.secondary">
                            Meeting scheduled for {new Date(contact.meetingDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < (campaign.contacts?.length || 0) - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignDetails; 