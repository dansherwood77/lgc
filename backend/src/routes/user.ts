import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { auth } from '../middleware/auth';
import bcrypt from 'bcryptjs';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Register a new user
router.post('/register', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, password, linkedinEmail, linkedinPassword } = req.body;
    console.log('Received registration request with data:', { 
      firstName, 
      lastName, 
      email, 
      linkedinEmail,
      hasPassword: !!password,
      hasLinkedinPassword: !!linkedinPassword
    });

    // Check each field individually and collect missing fields
    const missingFields = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!linkedinEmail) missingFields.push('linkedinEmail');
    if (!linkedinPassword) missingFields.push('linkedinPassword');

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'All fields are required', 
        missingFields 
      });
    }

    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    console.log('Creating new user with email:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword,
      linkedinEmail,
      linkedinPassword
    });
    
    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully');

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    
    const response = {
      message: 'User registered successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        linkedinEmail: user.linkedinEmail,
        createdAt: user.createdAt
      },
      token
    };
    
    console.log('Sending registration success response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error details:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to register user', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
});

// Login user
router.post('/login', async (req: AuthRequest, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Login successful, token generated');
    
    // Return user data without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };
    
    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req: AuthRequest, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'email', 'currentPassword', 'newPassword', 'confirmPassword'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    
    if (updates.includes('currentPassword') && updates.includes('newPassword') && updates.includes('confirmPassword')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }

      user.password = await bcrypt.hash(req.body.newPassword, 10);
      await user.save();
      return res.json({ message: 'Password updated successfully' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates.reduce((acc, key) => ({ ...acc, [key]: req.body[key] }), {}) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Logout user
router.post('/logout', auth, async (req: AuthRequest, res) => {
  try {
    // In a real application, you might want to invalidate the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router; 