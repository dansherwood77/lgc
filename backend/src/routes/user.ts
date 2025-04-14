import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Register a new user
router.post('/register', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, password, linkedinEmail, linkedinPassword } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !linkedinEmail || !linkedinPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({ firstName, lastName, email, password, linkedinEmail, linkedinPassword });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    
    // Return user data (excluding passwords) and token
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      linkedinEmail: user.linkedinEmail
    };
    
    res.status(201).json({ user: userResponse, token });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login user
router.post('/login', async (req: AuthRequest, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    
    // Return user data without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      linkedinEmail: user.linkedinEmail,
      linkedinPassword: user.linkedinPassword
    };
    
    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res) => {
  res.json(req.user);
});

// Update user profile
router.put('/profile', auth, async (req: AuthRequest, res) => {
  console.log('Received profile update request:', {
    body: req.body,
    user: req.user
  });

  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'email', 'currentPassword', 'newPassword', 'confirmPassword', 'linkedinEmail', 'linkedinPassword'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    console.log('Invalid updates attempted:', updates);
    return res.status(400).json({ 
      error: 'Invalid updates',
      attemptedUpdates: updates,
      allowedUpdates: allowedUpdates
    });
  }

  try {
    // If updating email, check if it's already taken
    if (updates.includes('email')) {
      const existingUser = await User.findOne({ email: req.body.email }).select('_id') as { _id: any } | null;
      if (existingUser && existingUser._id.toString() !== (req.user as any)._id.toString()) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // If updating password, validate current password and confirm password
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      
      if (!req.body.confirmPassword) {
        return res.status(400).json({ error: 'Please confirm your new password' });
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }
      
      const isMatch = await req.user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Update password
      req.user.password = req.body.newPassword;
    }

    // Update other fields
    updates.forEach(update => {
      if (update !== 'currentPassword' && update !== 'newPassword' && update !== 'confirmPassword') {
        console.log(`Updating field ${update} to:`, req.body[update]);
        (req.user as any)[update] = req.body[update];
      }
    });
    
    await req.user.save();
    
    // Return user data without password
    const userResponse = {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      linkedinEmail: req.user.linkedinEmail,
      linkedinPassword: req.user.linkedinPassword
    };
    
    console.log('Profile update successful:', userResponse);
    res.json(userResponse);
  } catch (error: any) {
    console.error('Profile update error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      validationErrors: error.errors
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: error.message,
        validationErrors: error.errors
      });
    }
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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