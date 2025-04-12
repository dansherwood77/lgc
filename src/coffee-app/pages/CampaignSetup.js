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
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
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

const roles = [
  'Software Engineer',
  'Product Manager',
  'Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Engineering Manager',
  'CTO',
  'CEO',
];

const seniorityLevels = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Director', 'VP'];

const CampaignSetup = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [location, setLocation] = useState('');
  const [outreachType, setOutreachType] = useState('virtual');
  const [targetRole, setTargetRole] = useState('');
  const [seniority, setSeniority] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  // Mock data for contacts
  const [contacts] = useState([
    { id: 1, name: 'John Doe', role: 'Senior Software Engineer', company: 'Tech Corp' },
    { id: 2, name: 'Jane Smith', role: 'Product Manager', company: 'Startup Inc' },
    // Add more mock contacts
  ]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement API call to create campaign
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const addTimeSlot = () => {
    if (startDate && endDate) {
      setTimeSlots([...timeSlots, { date: startDate, time: new Date() }]);
    }
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </FormControl>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup
                value={outreachType}
                onChange={(e) => setOutreachType(e.target.value)}
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
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Target Role</InputLabel>
              <Select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                label="Target Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Seniority Level</InputLabel>
              <Select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
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
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Review and select contacts
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
                      <IconButton edge="end" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
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
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Email Template"
                multiline
                rows={6}
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                placeholder="Write your email template here..."
              />
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                onClick={addTimeSlot}
                disabled={!startDate || !endDate}
              >
                Add Time Slot
              </Button>
            </Box>
            <List>
              {timeSlots.map((slot, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={slot.date.toLocaleDateString()}
                    secondary={slot.time.toLocaleTimeString()}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeTimeSlot(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Campaign
        </Typography>
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
    </Container>
  );
};

export default CampaignSetup; 