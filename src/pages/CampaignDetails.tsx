import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { DateRange } from '@mui/x-date-pickers-pro';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

interface User {
  id: number;
  name: string;
  role: string;
  company: string;
  status: 'responded' | 'no_response' | 'scheduled';
  meetingDate?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange<Date>>([null, null]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Sample data - in a real app, this would come from an API
  const users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Engineering Manager',
      company: 'Tech Corp',
      status: 'responded',
      meetingDate: '2024-04-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Product Manager',
      company: 'Startup Inc',
      status: 'scheduled',
      meetingDate: '2024-04-20',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'CTO',
      company: 'Innovation Labs',
      status: 'no_response',
    },
  ];

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

  const filteredUsers = users.filter(user => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return user.status === 'responded';
    if (tabValue === 2) return user.status === 'scheduled';
    if (tabValue === 3) return user.status === 'no_response';
    return true;
  });

  const handleScheduleClick = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setDateRange([null, null]);
    setStartTime(null);
    setEndTime(null);
  };

  const handleScheduleMeeting = () => {
    if (selectedUser && dateRange[0] && dateRange[1] && startTime && endTime) {
      // In a real app, you would make an API call here
      console.log('Scheduling meeting for:', {
        user: selectedUser,
        dateRange,
        startTime,
        endTime,
      });
      handleCloseDialog();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Campaign Details
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Campaign ID: {id}
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="user status tabs">
            <Tab label="All" />
            <Tab label="Responded" />
            <Tab label="Scheduled" />
            <Tab label="No Response" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <List>
            {filteredUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>{user.name.charAt(0)}</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{user.name}</Typography>
                        {getStatusChip(user.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {user.role} at {user.company}
                        </Typography>
                        {user.meetingDate && (
                          <Typography variant="body2" color="text.secondary">
                            Meeting scheduled for: {user.meetingDate}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EventIcon />}
                    disabled={user.status === 'scheduled'}
                    onClick={() => handleScheduleClick(user)}
                  >
                    Schedule Meeting
                  </Button>
                </ListItem>
                {index < filteredUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {filteredUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>{user.name.charAt(0)}</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{user.name}</Typography>
                        {getStatusChip(user.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {user.role} at {user.company}
                        </Typography>
                        {user.meetingDate && (
                          <Typography variant="body2" color="text.secondary">
                            Meeting scheduled for: {user.meetingDate}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EventIcon />}
                    disabled={user.status === 'scheduled'}
                    onClick={() => handleScheduleClick(user)}
                  >
                    Schedule Meeting
                  </Button>
                </ListItem>
                {index < filteredUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <List>
            {filteredUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>{user.name.charAt(0)}</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{user.name}</Typography>
                        {getStatusChip(user.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {user.role} at {user.company}
                        </Typography>
                        {user.meetingDate && (
                          <Typography variant="body2" color="text.secondary">
                            Meeting scheduled for: {user.meetingDate}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <List>
            {filteredUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>{user.name.charAt(0)}</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{user.name}</Typography>
                        {getStatusChip(user.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {user.role} at {user.company}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EventIcon />}
                    onClick={() => handleScheduleClick(user)}
                  >
                    Schedule Meeting
                  </Button>
                </ListItem>
                {index < filteredUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Card>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Schedule Meeting with {selectedUser?.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <DateRangePicker
                value={dateRange}
                onChange={(newValue: DateRange<Date>) => setDateRange(newValue)}
                sx={{ width: '100%', mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  sx={{ flex: 1 }}
                />
                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleScheduleMeeting} 
              variant="contained"
              disabled={!dateRange[0] || !dateRange[1] || !startTime || !endTime}
            >
              Schedule Meeting
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Container>
  );
};

export default CampaignDetails; 