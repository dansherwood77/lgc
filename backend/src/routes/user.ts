import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Register a new user
router.post('/register', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({ firstName, lastName, email, password });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    
    // Return user data (excluding password) and token
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
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
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error();
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res) => {
  res.json(req.user);
});

// Update user profile
router.put('/profile', auth, async (req: AuthRequest, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    updates.forEach(update => (req.user as any)[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
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