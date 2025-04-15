import express from 'express';
import { ApifyLinkedInScraper } from '../services/apifyLinkedInScraper';
import { auth } from '../middleware/auth';

const router = express.Router();

// Initialize the scraper with API token and LinkedIn cookie
const apiToken = process.env.APIFY_API_TOKEN;
const linkedinCookie = process.env.LINKEDIN_COOKIE;

if (!apiToken) {
  console.error('APIFY_API_TOKEN is not set in environment variables');
  throw new Error('APIFY_API_TOKEN is required');
}

if (!linkedinCookie) {
  console.error('LINKEDIN_COOKIE is not set in environment variables');
  throw new Error('LINKEDIN_COOKIE is required');
}

console.log('Initializing ApifyLinkedInScraper with:');
console.log('- API Token length:', apiToken.length);
console.log('- LinkedIn Cookie length:', linkedinCookie.length);
console.log('- Cookie format:', linkedinCookie.startsWith('[') ? 'JSON array' : 'Other format');

console.log('ApifyLinkedInScraper initialized successfully');

const scraper = new ApifyLinkedInScraper(apiToken, linkedinCookie);
// Search LinkedIn profiles
router.post('/search', auth, async (req, res) => {
  try {
    const { targetRole, location, seniority } = req.body;
    
    if (!targetRole || !location || !seniority) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log('Starting LinkedIn search process...');
    console.log('Search parameters:', { targetRole, location, seniority });
    

    // Search profiles
    const profiles = await scraper.searchProfiles(targetRole, location, seniority);
    console.log(`Found ${profiles.length} profiles`);

    res.json({ profiles });
  } catch (error) {
    console.error('LinkedIn search error:', error);
    res.status(500).json({ error: 'Failed to search LinkedIn' });
  }
});

// Update campaign with search results
router.post('/update-campaign', auth, async (req, res) => {
  try {
    const { campaignId, profiles, searchParams } = req.body;

    if (!campaignId || !profiles || !searchParams) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const contacts = await scraper.updateCampaignWithResults(campaignId, profiles, searchParams);
    res.json({ contacts });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

export default router; 