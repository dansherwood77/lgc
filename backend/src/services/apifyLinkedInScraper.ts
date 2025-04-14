import { ApifyClient } from 'apify-client';
import { Campaign } from '../models/Campaign';

interface LinkedInProfile {
  name: string;
  role: string;
  company: string;
  location: string;
  profileUrl: string;
  profilePicture?: string;
}

export class ApifyLinkedInScraper {
  private client: ApifyClient;
  private linkedinCookie: any[];

  constructor(apiToken: string, linkedinCookie: string) {
    if (!apiToken) {
      throw new Error('Apify API token is required');
    }
    if (!linkedinCookie) {
      throw new Error('LinkedIn cookie is required');
    }
    console.log('Initializing ApifyLinkedInScraper with token:', apiToken.substring(0, 10) + '...');
    this.client = new ApifyClient({
      token: apiToken,
    });
    try {
      this.linkedinCookie = JSON.parse(linkedinCookie);
      if (!Array.isArray(this.linkedinCookie)) {
        throw new Error('LinkedIn cookie must be a JSON array');
      }
    } catch (error) {
      console.error('Error parsing LinkedIn cookie:', error);
      throw new Error('Invalid LinkedIn cookie format');
    }
  }

  async searchProfiles(targetRole: string, location: string, seniority: string): Promise<LinkedInProfile[]> {
    try {
      console.log('Starting LinkedIn search with Apify...');
      console.log('Search parameters:', { targetRole, location, seniority });
      console.log('Cookie array length:', this.linkedinCookie.length);
      
      // Prepare the actor input
      const input = {
        searchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${targetRole} ${seniority}`)}&location=${encodeURIComponent(location)}`,
        startPage: 1,
        minDelay: 2,
        maxDelay: 5,
        cookie: this.linkedinCookie
      };

      console.log('Prepared input for Apify actor:', {
        searchUrl: input.searchUrl,
        startPage: input.startPage,
        minDelay: input.minDelay,
        maxDelay: input.maxDelay,
        cookieLength: input.cookie.length
      });

      // Run the actor and wait for it to finish
      console.log('Calling Apify actor...');
      try {
        const actor = this.client.actor('curious_coder/linkedin-people-search-scraper');
        console.log('Actor initialized, starting run...');
        
        // Add a timeout to the actor call
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Actor call timed out after 1 minute')), 60 * 1000);
        });

        const runPromise = actor.call(input);
        const run = await Promise.race([runPromise, timeoutPromise]) as any;
        
        console.log('Actor run completed:', {
          runId: run?.id,
          status: run?.status,
          defaultDatasetId: run?.defaultDatasetId,
          error: run?.error
        });
        
        if (!run?.defaultDatasetId) {
          throw new Error('No dataset ID returned from actor run');
        }

        console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);

        // Fetch and transform the results
        console.log('Fetching dataset items...');
        const dataset = this.client.dataset(run.defaultDatasetId);
        const { items } = await dataset.listItems();
        console.log(`Found ${items.length} profiles`);
        
        return items.map((item: any) => ({
          name: item.fullName,
          role: item.headline,
          company: item.headline?.split(' at ')[1] || '',
          location: item.location,
          profileUrl: item.profileUrl,
          profilePicture: item.profilePicture
        }));
      } catch (actorError) {
        console.error('Error during Apify actor execution:', {
          error: actorError,
          message: actorError instanceof Error ? actorError.message : 'Unknown error',
          stack: actorError instanceof Error ? actorError.stack : undefined,
          actorName: 'curious_coder/linkedin-people-search-scraper',
          input: {
            ...input,
            cookie: '[REDACTED]' // Don't log the full cookie
          }
        });
        throw actorError;
      }
    } catch (error) {
      console.error('Error searching LinkedIn with Apify:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  async updateCampaignWithResults(campaignId: string, profiles: LinkedInProfile[], searchParams: { location: string; targetRole: string; seniority: string }) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const contacts = profiles.map(profile => ({
        name: profile.name,
        role: profile.role,
        company: profile.company,
        selected: false,
        profilePicture: profile.profilePicture || '',
        profileUrl: profile.profileUrl,
        location: profile.location
      }));

      campaign.linkedinSearchResults = {
        contacts,
        total: contacts.length,
        currentPage: 1,
        pageSize: 50,
        totalPages: Math.ceil(contacts.length / 50),
        searchParams,
        lastUpdated: new Date()
      };

      await campaign.save();
      return contacts;
    } catch (error) {
      console.error('Error updating campaign with LinkedIn results:', error);
      throw error;
    }
  }
} 