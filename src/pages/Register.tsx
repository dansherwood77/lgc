import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  linkedinEmail: string;
  linkedinPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = React.useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      linkedinEmail: '',
      linkedinPassword: '',
    } as RegisterFormValues,
    validationSchema: Yup.object({
      firstName: Yup.string().required('Required'),
      lastName: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Required'),
      linkedinEmail: Yup.string().email('Invalid LinkedIn email address').required('Required'),
      linkedinPassword: Yup.string().required('LinkedIn password is required'),
    }),
    onSubmit: async (values: RegisterFormValues, { setSubmitting }: FormikHelpers<RegisterFormValues>) => {
      try {
        await register(
          values.email,
          values.password,
          values.firstName,
          values.lastName,
          values.linkedinEmail,
          values.linkedinPassword
        );
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to create an account. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            autoFocus
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
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
            onBlur={formik.handleBlur}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
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
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            LinkedIn Credentials
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="linkedinEmail"
            label="LinkedIn Email"
            name="linkedinEmail"
            autoComplete="email"
            value={formik.values.linkedinEmail}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.linkedinEmail && Boolean(formik.errors.linkedinEmail)}
            helperText={formik.touched.linkedinEmail && formik.errors.linkedinEmail}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="linkedinPassword"
            label="LinkedIn Password"
            type="password"
            id="linkedinPassword"
            value={formik.values.linkedinPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.linkedinPassword && Boolean(formik.errors.linkedinPassword)}
            helperText={formik.touched.linkedinPassword && formik.errors.linkedinPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
          >
            Sign Up
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} to="/login" variant="body2">
              Already have an account? Sign in
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register; 