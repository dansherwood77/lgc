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
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ICampaign } from '../types';
import LinkedInScraper from '../components/LinkedInScraper';

const steps = [
  'Location & Outreach Type',
  'Target Audience',
  'Review Contacts',
  'Email & Schedule',
];

interface Contact {
  id: number;
  name: string;
  role: string;
  company: string;
  selected: boolean;
  profilePicture: string;
  location?: string;
  linkedinUrl?: string;
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

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
              const newCampaign = await updateCampaign({
                name: `${outreachType} Outreach - ${location}`,
                description: `Outreach campaign in ${location} using ${outreachType} meetings`,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                targetRole: 'To be determined',
                location,
                outreachType,
                seniority: 'mid',
                status: 'draft'
              });
              
              if (newCampaign && newCampaign._id) {
                setCampaignId(newCampaign._id);
              }
            } else {
              await updateCampaign({
                location,
                outreachType
              });
            }
            break;
          case 1:
            await updateCampaign({
              targetRole,
              seniority
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
        name: `LinkedIn Outreach - ${location}`,
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

  const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
    <Box sx={{ mb: 2 }}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
              />
              {errors.location && <ErrorAlert message={errors.location} />}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Outreach Type</InputLabel>
              <Select
                value={outreachType}
                onChange={(e) => setOutreachType(e.target.value)}
                label="Outreach Type"
              >
                <MenuItem value="virtual">Virtual Meeting</MenuItem>
                <MenuItem value="in-person">In-Person Meeting</MenuItem>
              </Select>
              {errors.outreachType && <ErrorAlert message={errors.outreachType} />}
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Target Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                fullWidth
              />
              {errors.targetRole && <ErrorAlert message={errors.targetRole} />}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Seniority Level</InputLabel>
              <Select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                label="Seniority Level"
              >
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior Level</MenuItem>
                <MenuItem value="executive">Executive Level</MenuItem>
              </Select>
              {errors.seniority && <ErrorAlert message={errors.seniority} />}
            </FormControl>

            {campaignId && (
              <LinkedInScraper campaignId={campaignId} />
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Selected Contacts
            </Typography>
            <List>
              {contacts.filter(c => c.selected).map((contact) => (
                <ListItem key={contact.id}>
                  <ListItemAvatar>
                    <Avatar src={contact.profilePicture} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.name}
                    secondary={`${contact.role} at ${contact.company}`}
                  />
                  <IconButton onClick={() => toggleContactSelection(contact.id)}>
                    <CloseIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            {errors.contacts && <ErrorAlert message={errors.contacts} />}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Email Template"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              sx={{ mb: 3 }}
            />
            {errors.emailTemplate && <ErrorAlert message={errors.emailTemplate} />}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <DatePicker
                label="Send Date"
                value={sendDate}
                onChange={(newValue) => setSendDate(newValue)}
                sx={{ flex: 1 }}
              />
              {errors.sendDate && <ErrorAlert message={errors.sendDate} />}

              <TimePicker
                label="Send Time"
                value={sendTime}
                onChange={(newValue) => setSendTime(newValue)}
                sx={{ flex: 1 }}
              />
              {errors.sendTime && <ErrorAlert message={errors.sendTime} />}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Campaign
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="campaign setup tabs" sx={{ mb: 3 }}>
          <Tab label="Campaign Setup" />
          <Tab label="LinkedIn Search" />
        </Tabs>
        
        {activeTab === 0 && (
          <>
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
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={
                  activeStep === steps.length - 1 ? handleSubmit : handleNext
                }
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              LinkedIn Search
            </Typography>
            <Typography variant="body2" paragraph>
              Use our LinkedIn search to find potential contacts based on their roles and experience.
            </Typography>
            {campaignId ? (
              <LinkedInScraper campaignId={campaignId} />
            ) : (
              <Alert severity="info">
                Please save your campaign first to use this feature.
              </Alert>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CampaignSetup; 