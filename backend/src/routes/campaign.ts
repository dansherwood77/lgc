import express, { Request } from 'express';
import { Campaign } from '../models/Campaign';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Create a new campaign
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const requiredFields = ['name', 'description', 'startDate', 'endDate', 'targetRole', 'location', 'seniority', 'outreachType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const campaign = new Campaign({
      ...req.body,
      createdBy: req.user._id
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create campaign' });
  }
});

// Get all campaigns for the authenticated user
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    console.log('Fetching campaigns for user:', req.user._id);
    const campaigns = await Campaign.find({ createdBy: req.user._id });
    console.log('Found campaigns:', campaigns.length);
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get a specific campaign
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Update a campaign
router.put('/:id', auth, async (req: AuthRequest, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name',
    'description',
    'startDate',
    'endDate',
    'targetRole',
    'location',
    'seniority',
    'outreachType',
    'status',
    'linkedinSearchResults',
    'emailTemplate'
  ];
  
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    console.error('Invalid updates attempted:', updates);
    console.error('Allowed updates:', allowedUpdates);
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    console.log('Finding campaign with ID:', req.params.id);
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!campaign) {
      console.error('Campaign not found:', req.params.id);
      return res.status(404).json({ error: 'Campaign not found' });
    }

    console.log('Updating campaign with data:', req.body);
    updates.forEach(update => {
      console.log(`Setting ${update} to:`, req.body[update]);
      (campaign as any)[update] = req.body[update];
    });

    await campaign.save();
    console.log('Campaign updated successfully');
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(400).json({ error: 'Failed to update campaign' });
  }
});

// Delete a campaign
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router; 