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
      // TODO: Implement API call to create campaign
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

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            {errors.location && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.location}
              </Alert>
            )}
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
            {errors.outreachType && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.outreachType}
              </Alert>
            )}
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
            {errors.targetRole && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.targetRole}
              </Alert>
            )}
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
            {errors.seniority && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.seniority}
              </Alert>
            )}
            <FormControl fullWidth required error={!!errors.seniority}>
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
            {errors.contacts && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.contacts}
              </Alert>
            )}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Review and select contacts ({contacts.filter(c => c.selected).length} selected)
            </Typography>
            <List>
              {contacts.map((contact) => (
                <React.Fragment key={contact.id}>
                  <ListItem>
                    <ListItemText
                      primary={contact.name}
                      secondary={`${contact.role} at ${contact.company}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="select"
                        onClick={() => {
                          toggleContactSelection(contact.id);
                          if (errors.contacts) {
                            setErrors(prev => ({ ...prev, contacts: '' }));
                          }
                        }}
                      >
                        {contact.selected ? <CheckIcon color="primary" /> : <EditIcon />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            {errors.emailTemplate && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.emailTemplate}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Email Template"
              multiline
              rows={6}
              value={emailTemplate}
              onChange={(e) => {
                setEmailTemplate(e.target.value);
                if (errors.emailTemplate) {
                  setErrors(prev => ({ ...prev, emailTemplate: '' }));
                }
              }}
              required
              error={!!errors.emailTemplate}
              placeholder="Write your email template here..."
              sx={{ mb: 3 }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                setEmailTemplate("Hi [Name],\n\nI came across your profile and was impressed by your work at [Company]. I'd love to connect and learn more about your experience in [Role]. Would you be interested in a virtual coffee chat?\n\nBest regards,\n[Your Name]");
                if (errors.emailTemplate) {
                  setErrors(prev => ({ ...prev, emailTemplate: '' }));
                }
              }}
              sx={{ mb: 2 }}
            >
              Use Template
            </Button>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {errors.sendDate && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.sendDate}
                  </Alert>
                )}
                <DatePicker
                  label="Send Date"
                  value={sendDate}
                  onChange={(newValue) => {
                    setSendDate(newValue);
                    if (errors.sendDate) {
                      setErrors(prev => ({ ...prev, sendDate: '' }));
                    }
                  }}
                  sx={{ flex: 1 }}
                />
                {errors.sendTime && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.sendTime}
                  </Alert>
                )}
                <TimePicker
                  label="Send Time"
                  value={sendTime}
                  onChange={(newValue) => {
                    setSendTime(newValue);
                    if (errors.sendTime) {
                      setErrors(prev => ({ ...prev, sendTime: '' }));
                    }
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Create New Campaign</Typography>
          <IconButton onClick={() => setShowExitDialog(true)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
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
      </Paper>

      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle>Exit Campaign Creation?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to exit? All progress will be lost.</Typography>
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