import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ICampaign } from '../types';

const steps = [
  'Location & Outreach Type',
  'Target Audience',
  'Review Contacts',
  'Email & Schedule',
];

const seniorityLevels = ['Entry Level', 'Associate', 'Mid-Senior Level', 'Director', 'Executive'];

interface Contact {
  id: number;
  name: string;
  role: string;
  company: string;
  selected: boolean;
  profilePicture?: string;
}

const CampaignSetup: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [location, setLocation] = useState('');
  const [outreachType, setOutreachType] = useState('virtual');
  const [targetRole, setTargetRole] = useState('');
  const [seniority, setSeniority] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [sendDate, setSendDate] = useState<Date | null>(null);
  const [sendTime, setSendTime] = useState<Date | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const pageSize = 10;

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    switch (step) {
      case 0:
        if (!location) {
          newErrors.location = 'Location is required';
        }
        if (!outreachType) {
          newErrors.outreachType = 'Please select an outreach type';
        }
        break;
      case 1:
        if (!targetRole) {
          newErrors.targetRole = 'Target role is required';
        }
        if (!seniority) {
          newErrors.seniority = 'Seniority level is required';
        }
        break;
      case 2:
        if (!contacts.some(c => c.selected)) {
          newErrors.contacts = 'Please select at least one contact';
        }
        break;
      case 3:
        if (!emailTemplate) {
          newErrors.emailTemplate = 'Email template is required';
        }
        if (!sendDate) {
          newErrors.sendDate = 'Send date is required';
        }
        if (!sendTime) {
          newErrors.sendTime = 'Send time is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateCampaign = async (data: Partial<ICampaign>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const url = campaignId 
        ? `http://localhost:5001/api/campaigns/${campaignId}`
        : 'http://localhost:5001/api/campaigns';

      const method = campaignId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }

      const result = await response.json();
      if (!campaignId) {
        setCampaignId(result._id);
      }
      return result;
    } catch (error) {
      console.error('Error updating campaign:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to update campaign. Please try again.'
      }));
      throw error;
    }
  };

  const handleNext = async () => {
    if (validateStep(activeStep)) {
      try {
        switch (activeStep) {
          case 0:
            if (!campaignId) {
              // Initial campaign creation
              await updateCampaign({
                name: `${outreachType} Outreach - ${location}`,
                description: `Outreach campaign in ${location} using ${outreachType} meetings`,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                targetRole: 'To be determined', // Initial value
                location,
                outreachType,
                status: 'draft'
              });
            } else {
              // Update existing campaign
              await updateCampaign({
                location,
                outreachType
              });
            }
            break;
          case 1:
            await updateCampaign({
              targetRole,
              linkedinSearchResults: {
                contacts: [],
                total: 0,
                currentPage: 1,
                pageSize: 10,
                totalPages: 0,
                searchParams: {
                  location,
                  targetRole,
                  seniority
                },
                lastUpdated: new Date()
              },
              status: 'draft'
            });
            break;
          case 2:
            await updateCampaign({
              linkedinSearchResults: {
                contacts: contacts.map(contact => ({
                  ...contact,
                  profilePicture: contact.profilePicture || ''
                })),
                total: totalResults,
                currentPage,
                pageSize,
                totalPages,
                searchParams: {
                  location,
                  targetRole,
                  seniority
                },
                lastUpdated: new Date()
              },
              status: 'draft'
            });
            break;
        }
        setActiveStep((prevStep) => prevStep + 1);
      } catch (error) {
        console.error('Error saving campaign step:', error);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep(activeStep)) return;

      const startDateTime = new Date(sendDate!);
      startDateTime.setHours(sendTime!.getHours(), sendTime!.getMinutes());
      
      const endDateTime = new Date(sendDate!);
      endDateTime.setHours(sendTime!.getHours() + 1, sendTime!.getMinutes());

      await updateCampaign({
        name: `${targetRole} Outreach - ${location}`,
        description: `Outreach campaign targeting ${targetRole} in ${location} using ${outreachType} meetings`,
        startDate: startDateTime,
        endDate: endDateTime,
        emailTemplate,
        status: 'active'
      });

      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const toggleContactSelection = (contactId: number) => {
    setContacts(contacts.map(contact => 
      contact.id === contactId ? { ...contact, selected: !contact.selected } : contact
    ));
  };

  const searchLinkedIn = async (page: number = 1) => {
    try {
      setSearching(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('http://localhost:5001/api/linkedin/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          location, 
          targetRole, 
          seniority,
          page,
          pageSize,
          campaignId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to search LinkedIn');
      }

      const data = await response.json();
      const newContacts = data.contacts.map((contact: any, index: number) => ({
        ...contact,
        id: (page - 1) * pageSize + index + 1,
        selected: false,
        profilePicture: contact.profilePicture || ''
      }));
      
      setContacts(newContacts);
      setTotalPages(data.totalPages);
      setTotalResults(data.total);
      setCurrentPage(page);

      // Update campaign with new search results
      if (campaignId) {
        await updateCampaign({
          linkedinSearchResults: {
            contacts: newContacts,
            total: data.total,
            currentPage: page,
            pageSize,
            totalPages: data.totalPages,
            searchParams: {
              location,
              targetRole,
              seniority
            },
            lastUpdated: new Date()
          }
        });
      }
    } catch (error) {
      console.error('LinkedIn search error:', error);
      setErrors(prev => ({
        ...prev,
        linkedin: 'Failed to search LinkedIn. Please try again.'
      }));
    } finally {
      setSearching(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault(); // Prevent default anchor behavior
    searchLinkedIn(value);
  };

  const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
    <Box sx={{ mb: 2 }}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            {errors.location && <ErrorAlert message={errors.location} />}
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) {
                  setErrors(prev => ({ ...prev, location: '' }));
                }
              }}
              required
              error={!!errors.location}
              sx={{ mb: 3 }}
            />
            {errors.outreachType && <ErrorAlert message={errors.outreachType} />}
            <FormControl component="fieldset" sx={{ mb: 3 }} error={!!errors.outreachType}>
              <RadioGroup
                value={outreachType}
                onChange={(e) => {
                  setOutreachType(e.target.value);
                  if (errors.outreachType) {
                    setErrors(prev => ({ ...prev, outreachType: '' }));
                  }
                }}
              >
                <FormControlLabel
                  value="virtual"
                  control={<Radio />}
                  label="Virtual (Zoom/Google Meet)"
                />
                <FormControlLabel
                  value="in-person"
                  control={<Radio />}
                  label="In-person Coffee Meeting"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            {errors.targetRole && <ErrorAlert message={errors.targetRole} />}
            <TextField
              fullWidth
              label="Target Role"
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                if (errors.targetRole) {
                  setErrors(prev => ({ ...prev, targetRole: '' }));
                }
              }}
              required
              error={!!errors.targetRole}
              sx={{ mb: 3 }}
            />
            {errors.seniority && <ErrorAlert message={errors.seniority} />}
            <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.seniority}>
              <InputLabel>Seniority Level</InputLabel>
              <Select
                value={seniority}
                onChange={(e) => {
                  setSeniority(e.target.value);
                  if (errors.seniority) {
                    setErrors(prev => ({ ...prev, seniority: '' }));
                  }
                }}
                label="Seniority Level"
              >
                {seniorityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            {errors.contacts && <ErrorAlert message={errors.contacts} />}
            {errors.linkedin && <ErrorAlert message={errors.linkedin} />}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Review Contacts</Typography>
              <Button
                variant="contained"
                onClick={() => searchLinkedIn(1)}
                disabled={searching || !location || !targetRole || !seniority}
                startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                {searching ? 'Searching...' : 'Search LinkedIn'}
              </Button>
            </Box>
            <Paper>
              <List>
                {contacts.map((contact) => (
                  <ListItem
                    key={contact.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        {contact.selected ? <CheckIcon color="primary" /> : <AddIcon />}
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      {contact.profilePicture ? (
                        <Avatar src={contact.profilePicture} alt={contact.name} />
                      ) : (
                        <Avatar>{contact.name.charAt(0)}</Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {contact.role}
                          </Typography>
                          {` — ${contact.company}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {contacts.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No contacts found"
                      secondary="Use the search button to find contacts on LinkedIn"
                    />
                  </ListItem>
                )}
              </List>
              {totalResults > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    disabled={searching}
                  />
                </Box>
              )}
            </Paper>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            {errors.emailTemplate && <ErrorAlert message={errors.emailTemplate} />}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Email Template"
                value={emailTemplate}
                onChange={(e) => {
                  setEmailTemplate(e.target.value);
                  if (errors.emailTemplate) {
                    setErrors(prev => ({ ...prev, emailTemplate: '' }));
                  }
                }}
                required
                error={!!errors.emailTemplate}
                multiline
                rows={4}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  // Generate a template based on the campaign details
                  const template = `Hi [Name],

I noticed your role as ${targetRole} at [Company] and would love to connect. I'm reaching out because ${outreachType === 'virtual' ? 'I think a virtual meeting' : 'I think a coffee chat'} would be valuable for both of us.

Would you be open to ${outreachType === 'virtual' ? 'a 30-minute virtual meeting' : 'grabbing coffee'} to discuss potential opportunities?

Best regards,
[Your Name]`;

                  setEmailTemplate(template);
                }}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Generate Template
              </Button>
            </Box>
            {errors.sendDate && <ErrorAlert message={errors.sendDate} />}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Send Date"
                value={sendDate}
                onChange={(newValue) => {
                  setSendDate(newValue);
                  if (errors.sendDate) {
                    setErrors(prev => ({ ...prev, sendDate: '' }));
                  }
                }}
                sx={{ mb: 3, width: '100%' }}
              />
            </LocalizationProvider>
            {errors.sendTime && <ErrorAlert message={errors.sendTime} />}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Send Time"
                value={sendTime}
                onChange={(newValue) => {
                  setSendTime(newValue);
                  if (errors.sendTime) {
                    setErrors(prev => ({ ...prev, sendTime: '' }));
                  }
                }}
                sx={{ mb: 3, width: '100%' }}
              />
            </LocalizationProvider>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Campaign
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {errors.submit && <ErrorAlert message={errors.submit} />}
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={() => setShowExitDialog(true)}
            color="inherit"
          >
            Cancel
          </Button>
          <Box>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Create Campaign' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle>Exit Campaign Creation?</DialogTitle>
        <DialogContent>
          Are you sure you want to exit? All progress will be lost.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExitDialog(false)}>Cancel</Button>
          <Button onClick={() => navigate('/campaigns')} color="error">
            Exit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignSetup; 