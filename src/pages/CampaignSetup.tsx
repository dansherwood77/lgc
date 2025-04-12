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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: 'John Doe', role: 'Senior Software Engineer', company: 'Tech Corp', selected: false },
    { id: 2, name: 'Jane Smith', role: 'Product Manager', company: 'Startup Inc', selected: false },
  ]);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Combine date and time for start and end dates
      const startDateTime = new Date(sendDate!);
      startDateTime.setHours(sendTime!.getHours(), sendTime!.getMinutes());
      
      const endDateTime = new Date(sendDate!);
      endDateTime.setHours(sendTime!.getHours() + 1, sendTime!.getMinutes()); // Assuming 1 hour duration

      const campaignData = {
        name: `${targetRole} Outreach - ${location}`,
        description: `Outreach campaign targeting ${targetRole} in ${location} using ${outreachType} meetings`,
        startDate: startDateTime,
        endDate: endDateTime,
        targetRole,
        location,
        outreachType,
        status: 'draft' as const,
        emailTemplate
      };

      const response = await fetch('http://localhost:5001/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to create campaign. Please try again.'
      }));
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
            <Paper sx={{ p: 2 }}>
              <List>
                {contacts.map((contact) => (
                  <ListItem key={contact.id}>
                    <ListItemText
                      primary={contact.name}
                      secondary={`${contact.role} at ${contact.company}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        {contact.selected ? <CheckIcon color="primary" /> : <CloseIcon />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
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