import express from 'express';
import { auth } from '../middleware/auth';
import { LinkedInScraper } from '../services/linkedinScraper';
import { User } from '../models/User';

const router = express.Router();
const scraper = new LinkedInScraper();

interface AuthenticatedRequest extends express.Request {
  user: {
    _id: string;
    email: string;
  };
}

router.post('/search', auth, async (req: express.Request, res: express.Response) => {
  console.log('Starting LinkedIn search process...');
  
  try {
    // Check user verification
    const user = await User.findById((req as AuthenticatedRequest).user._id);
    if (!user) {
      console.error('User not found:', (req as AuthenticatedRequest).user._id);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      console.error('User not verified:', user.email);
      return res.status(403).json({ error: 'Please verify your email before using LinkedIn search' });
    }

    if (!user.linkedinEmail || !user.linkedinPassword) {
      console.error('LinkedIn credentials not set for user:', user.email);
      return res.status(400).json({ error: 'Please set your LinkedIn credentials in your profile' });
    }

    const { targetRole, location, seniority, campaignId } = req.body;
    console.log('Search parameters:', { targetRole, location, seniority, campaignId });
    
    if (!targetRole || !location || !seniority || !campaignId) {
      console.error('Missing required fields:', { targetRole, location, seniority, campaignId });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Initializing LinkedIn scraper...');
    await scraper.initialize();

    console.log('Starting LinkedIn profile search...');
    const profiles = await scraper.searchProfiles(targetRole, location, seniority);
    console.log(`Found ${profiles.length} profiles`);

    console.log('Updating campaign with search results...');
    const contacts = await scraper.updateCampaignWithResults(campaignId, profiles, { location, targetRole, seniority });
    console.log('Campaign updated successfully');

    res.json({ contacts });
  } catch (error) {
    console.error('LinkedIn search error:', error);
    res.status(500).json({ error: 'Failed to search LinkedIn' });
  } finally {
    console.log('Closing LinkedIn scraper...');
    await scraper.close();
  }
});

export default router; 