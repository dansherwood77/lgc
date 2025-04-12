import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required'),
  lastName: Yup.string()
    .required('Last name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  currentPassword: Yup.string(),
  newPassword: Yup.string()
    .min(8, 'Password should be of minimum 8 characters length')
    .when('currentPassword', (currentPassword, schema) => {
      return currentPassword && currentPassword.length > 0
        ? schema.required('New password is required when changing password')
        : schema;
    }),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .when('newPassword', (newPassword, schema) => {
      return newPassword && newPassword.length > 0
        ? schema.required('Please confirm your new password')
        : schema;
    }),
});

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // In a real app, you would make an API call to update the profile
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to update profile. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
            }}
          >
            {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            Profile Settings
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {success}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Change Password
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                margin="normal"
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                id="currentPassword"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                helperText={formik.touched.currentPassword && formik.errors.currentPassword}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Box>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
              >
                Logout
              </Button>
              <Button
                type="submit"
                variant="contained"
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 