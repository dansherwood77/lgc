import puppeteer, { Browser } from 'puppeteer';
import { Campaign } from '../models/Campaign';

interface LinkedInProfile {
  name: string;
  role: string;
  company: string;
  location: string;
  profileUrl: string;
  profilePicture?: string;
}

export class LinkedInScraper {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async searchProfiles(targetRole: string, location: string, seniority: string): Promise<LinkedInProfile[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    try {
      // Navigate to LinkedIn search
      const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(targetRole)}&location=${encodeURIComponent(location)}&origin=FACETED_SEARCH&page=1`;
      await page.goto(searchUrl, { waitUntil: 'networkidle0' });

      // Wait for search results to load
      await page.waitForSelector('.search-results-container', { timeout: 10000 });

      // Extract profile information
      const profiles = await page.evaluate(() => {
        const results: LinkedInProfile[] = [];
        const profileElements = document.querySelectorAll('.entity-result__item');

        profileElements.forEach((element) => {
          const nameElement = element.querySelector('.entity-result__title-text');
          const roleElement = element.querySelector('.entity-result__primary-subtitle');
          const companyElement = element.querySelector('.entity-result__secondary-subtitle');
          const locationElement = element.querySelector('.entity-result__simple-insight-text');
          const profileLink = element.querySelector('a.app-aware-link');

          if (nameElement && roleElement && profileLink) {
            results.push({
              name: nameElement.textContent?.trim() || '',
              role: roleElement.textContent?.trim() || '',
              company: companyElement?.textContent?.trim() || '',
              location: locationElement?.textContent?.trim() || '',
              profileUrl: profileLink.getAttribute('href') || '',
              profilePicture: document.querySelector('.entity-result__item .profile-picture')?.getAttribute('style')?.match(/background-image: url\((.*?)\)/)?.[1] || ''
            });
          }
        });

        return results;
      });

      return profiles;
    } catch (error) {
      console.error('Error searching LinkedIn:', error);
      throw error;
    } finally {
      await page.close();
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
        profilePicture: profile.profilePicture || ''
      }));

      campaign.linkedinSearchResults = {
        contacts,
        total: contacts.length,
        currentPage: 1,
        pageSize: 10,
        totalPages: Math.ceil(contacts.length / 10),
        searchParams,
        lastUpdated: new Date()
      };

      await campaign.save();
      return contacts;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 