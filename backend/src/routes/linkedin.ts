import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page, ElementHandle } from 'puppeteer';
import { auth } from '../middleware/auth';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

puppeteer.use(StealthPlugin());

interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  profilePicture: string;
  selected: boolean;
  linkedinUrl: string;
  connection: string;
}

interface LinkedInSearchResults {
  contacts: Contact[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  searchParams: {
    location: string;
    targetRole: string;
    seniority: string;
  };
  lastUpdated: Date;
}

interface LinkedInContact {
  name: string;
  role: string;
  company: string;
  location: string;
  profilePic: string;
  connection: string;
  linkedinUrl: string;
}

const router = express.Router();

// Updated and expanded selectors for more reliable LinkedIn scraping
const SELECTORS = {
  SEARCH_CONTAINER: [
    '.search-results-container',
    '.scaffold-layout__list',
    '.search-results__container',
    '.scaffold-layout__content',
    '.pv-search-results',
    '.search-results',
    'section[data-test-search-results-container]'
  ],
  CONTACT_ITEM: [
    '.entity-result__item',
    '.reusable-search__result-container',
    '.search-result',
    '.ember-view.artdeco-list__item',
    '.artdeco-list__item',
    'li.reusable-search__result-container'
  ],
  NAME: [
    '.entity-result__title-text a', 
    '.entity-result__title-text span[aria-hidden="true"]',
    '.app-aware-link span[aria-hidden="true"]'
  ],
  ROLE: [
    '.entity-result__primary-subtitle',
    '.entity-result__summary',
    '.linked-area .entity-result__primary-subtitle'
  ],
  COMPANY: [
    '.entity-result__secondary-subtitle',
    '.entity-result__summary .entity-result__primary-subtitle + *'
  ],
  LOCATION: [
    '.entity-result__simple-subtitle',
    '.entity-result__secondary-subtitle + *',
    '.presence-entity__image + * + .t-black--light'
  ],
  PROFILE_LINK: [
    '.entity-result__title-text a',
    '.app-aware-link'
  ],
  PROFILE_PIC: [
    '.presence-entity__image',
    'img[alt*="profile"]',
    '.ivm-entity-picture--profile-image img'
  ],
  CONNECTION: [
    '.entity-result__badge-text',
    '.distance-badge',
    '.search-result__connection-strength'
  ],
  NEXT_BUTTON: [
    'button[aria-label="Next"]',
    '.artdeco-pagination__button--next'
  ]
};

// Helper function to get text from an element with fallbacks
async function extractTextContent(page: Page, element: ElementHandle<Element> | null, selectors: string[]): Promise<string> {
  if (!element) return '';
  
  try {
    const text = await page.evaluate((el, sels) => {
      for (const sel of sels) {
        const target = el.querySelector(sel);
        if (target) {
          return target.textContent?.trim() || '';
        }
      }
      return el.textContent?.trim() || '';
    }, element, selectors);
    
    return text;
  } catch (e) {
    return '';
  }
}

// Enhanced function to wait for any selector from an array
async function waitForAnySelector(page: Page, selectors: string[], timeout: number = 10000): Promise<string | null> {
  const promises = selectors.map(selector => {
    return page.waitForSelector(selector, { timeout })
      .then(() => selector)
      .catch(() => null);
  });
  
  const results = await Promise.all(promises);
  const foundSelector = results.find(result => result !== null);
  return foundSelector || null;
}

// Helper function to navigate to search page with more robust page loading
async function navigateToSearch(page: Page, targetRole: string, location: string): Promise<void> {
  console.log(`Navigating to LinkedIn search page for role: "${targetRole}" in location: "${location}"`);
  const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(targetRole)}&location=${encodeURIComponent(location)}&origin=FACETED_SEARCH&page=1`;
  
  try {
    // Navigate with extended timeout
    await page.goto(searchUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    console.log('Page loaded. Attempting multiple strategies to verify search results...');
    
    // Strategy 1: Take a screenshot immediately for debugging
    await page.screenshot({ path: 'linkedin-search-page.png' });
    console.log('Screenshot saved as linkedin-search-page.png');
    
    // Strategy 2: Wait for page to settle
    console.log('Waiting for page to settle...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Strategy 3: Try each search container selector with a short timeout
    console.log('Trying each search container selector...');
    let containerFound = false;
    
    for (const selector of SELECTORS.SEARCH_CONTAINER) {
      try {
        console.log(`Trying selector: ${selector}`);
        const element = await page.waitForSelector(selector, { timeout: 5000 });
        if (element) {
          console.log(`✅ Search container found using selector: ${selector}`);
          containerFound = true;
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!containerFound) {
      console.log('❌ Could not find search container with predefined selectors.');
      console.log('Trying to find any container elements on the page...');
      
      // Strategy 4: Look for any container-like elements
      const containerElements = await page.evaluate(() => {
        const possibleContainers: Array<{
          selector: string;
          children: number;
          width: number;
          height: number;
        }> = [];
        // Look for common container elements
        const containers = document.querySelectorAll('div.search-results, div[class*="search"], section, ul[class*="results"], .artdeco-list');
        containers.forEach((container, index) => {
          const rect = container.getBoundingClientRect();
          // Only consider visible elements with reasonable size
          if (rect.width > 300 && rect.height > 300) {
            possibleContainers.push({
              selector: container.tagName + (container.id ? `#${container.id}` : '') + 
                       (container.className ? `.${container.className.replace(/\s+/g, '.')}` : ''),
              children: container.children.length,
              width: rect.width,
              height: rect.height
            });
          }
        });
        return possibleContainers;
      });
      
      console.log('Potential container elements found:', containerElements);
      
      // Take another screenshot
      await page.screenshot({ path: 'linkedin-search-page-containers.png' });
      console.log('Updated screenshot saved as linkedin-search-page-containers.png');
      
      if (containerElements.length > 0) {
        console.log('Found potential container elements, will try to proceed anyway');
      } else {
        console.log('No potential container elements found on the page');
      }
    }
    
    // Strategy 5: Check if page contains people results text
    const pageText = await page.evaluate(() => document.body.innerText);
    if (pageText.includes('results for') || pageText.includes('People') || pageText.includes('Showing results')) {
      console.log('✅ Page appears to contain search results based on text content');
    } else {
      console.log('❌ Page may not contain search results based on text content');
    }
    
  } catch (error) {
    console.error('Error during navigation to search page:', error);
    await page.screenshot({ path: 'navigation-error.png' });
    console.log('Error screenshot saved as navigation-error.png');
    throw error;
  }
}

// Enhanced function to extract contacts with DOM analysis fallback
async function extractContacts(page: Page, maxRetries: number = 3): Promise<LinkedInContact[]> {
  let retries = 0;
  let contacts: LinkedInContact[] = [];
  
  while (retries < maxRetries && contacts.length === 0) {
    try {
      console.log('Starting contact extraction attempt', retries + 1);
      
      // Wait for any container selector to be available
      console.log('Looking for search results container...');
      
      // Take a screenshot of current state
      await page.screenshot({ path: `search-page-state-${retries}.png` });
      console.log(`Current page state screenshot saved as search-page-state-${retries}.png`);
      
      // Try with each selector
      let containerSelector = null;
      for (const selector of SELECTORS.SEARCH_CONTAINER) {
        try {
          console.log(`Checking for container with selector: ${selector}`);
          const exists = await page.$(selector);
          if (exists) {
            containerSelector = selector;
            console.log(`✅ Found search container using selector: ${selector}`);
            break;
          }
        } catch (e) {
          console.log(`Error checking selector ${selector}:`, e);
        }
      }
      
      if (!containerSelector) {
        console.log('❌ Standard search container not found, trying adaptive approach...');
        
        // Fallback: Look for list elements that might contain search results
        const listElements = await page.evaluate(() => {
          // Find all list elements that might contain results
          const lists = Array.from(document.querySelectorAll('ul, ol, div[role="list"]'));
          return lists
            .filter(list => list.children.length > 3) // Lists with several children
            .map(list => {
              const path: string[] = [];
              let current: Element | null = list;
              while (current && current !== document.body) {
                let selector = current.tagName.toLowerCase();
                if (current.id) {
                  selector += `#${current.id}`;
                } else if (current.className) {
                  selector += `.${current.className.split(' ').join('.')}`;
                }
                path.unshift(selector);
                current = current.parentElement;
              }
              return {
                selector: path.join(' > '),
                childCount: list.children.length
              };
            });
        });
        
        console.log('Potential list elements found:', listElements);
        
        if (listElements.length > 0) {
          // Try the list element with the most children
          const mostLikelyList = listElements.sort((a, b) => b.childCount - a.childCount)[0];
          console.log(`Trying most likely list container: ${mostLikelyList.selector} with ${mostLikelyList.childCount} children`);
          
          const exists = await page.$(mostLikelyList.selector);
          if (exists) {
            containerSelector = mostLikelyList.selector;
            console.log(`✅ Using adaptive container: ${containerSelector}`);
          }
        }
      }
      
      // If still no container, try to proceed with contact items directly
      if (!containerSelector) {
        console.log('❌ No suitable container found, trying to find contact items directly...');
        // Take a screenshot for debugging
        await page.screenshot({ path: `missing-container-${retries}.png` });
        console.log(`Screenshot saved as missing-container-${retries}.png`);
        
        // If we've already retried, refresh and try again
        if (retries > 0) {
          console.log('Refreshing page and trying again...');
          await page.reload({ waitUntil: 'networkidle0' });
          retries++;
          continue;
        }
      }
      
      // Wait for any contact item to be available
      console.log('Looking for contact items in the search results...');
      let contactSelector: string | null = null;
      let contactElements: ElementHandle<Element>[] = [];
      
      // Try each contact selector
      for (const selector of SELECTORS.CONTACT_ITEM) {
        try {
          console.log(`Checking for contacts with selector: ${selector}`);
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            contactSelector = selector;
            contactElements = elements;
            console.log(`✅ Found ${elements.length} contact items using selector: ${selector}`);
            break;
          }
        } catch (e) {
          console.log(`Error checking contact selector ${selector}:`, e);
        }
      }
      
      if (!contactSelector || contactElements.length === 0) {
        console.log('❌ No contact items found with standard selectors, trying adaptive approach...');
        
        // Look for elements that look like profile cards
        const potentialProfiles = await page.evaluate(() => {
          // Look for elements that might be profile cards
          const elements = Array.from(document.querySelectorAll('div, li, article'));
          return elements
            .filter(el => {
              // Profile cards often have images and certain text patterns
              const hasImage = el.querySelector('img') !== null;
              const text = el.textContent || '';
              // Profiles often mention connections, roles, or companies
              const hasProfileText = text.includes('connection') || 
                                    text.match(/\b(at|@)\b/) !== null || 
                                    text.match(/\b(CEO|CTO|Manager|Director|Engineer|Developer)\b/) !== null;
              return hasImage && hasProfileText && text.length > 50;
            })
            .map(el => {
              // Create a simple CSS selector path
              let current: Element | null = el;
              const path: string[] = [];
              while (current && current !== document.body) {
                let selector = current.tagName.toLowerCase();
                if (current.id) {
                  selector += `#${current.id}`;
                } else if (current.className) {
                  const classes = Array.from(current.classList).join('.');
                  if (classes) selector += `.${classes}`;
                }
                path.unshift(selector);
                current = current.parentElement;
              }
              return {
                text: el.textContent?.substring(0, 100) || '',
                selector: path.join(' > '),
                hasImage: el.querySelector('img') !== null,
                hasLink: el.querySelector('a') !== null
              };
            });
        });
        
        console.log('Potential profile elements found:', potentialProfiles.length);
        
        if (potentialProfiles.length > 0) {
          // Try the first profile element
          const firstProfile = potentialProfiles[0];
          console.log(`Trying adaptive profile selector: ${firstProfile.selector}`);
          
          try {
            contactElements = await page.$$(firstProfile.selector);
            if (contactElements.length > 0) {
              contactSelector = firstProfile.selector;
              console.log(`✅ Using adaptive contact selector: ${contactSelector} with ${contactElements.length} elements`);
            }
          } catch (e) {
            console.log('Error using adaptive selector:', e);
          }
        }
      }
      
      if (!contactSelector || contactElements.length === 0) {
        console.log('❌ No contact items found after all attempts, retrying...');
        // Take a screenshot for debugging
        await page.screenshot({ path: `missing-contacts-${retries}.png` });
        console.log(`Screenshot saved as missing-contacts-${retries}.png`);
        await page.reload({ waitUntil: 'networkidle0' });
        retries++;
        continue;
      }
      
      console.log(`✅ Found ${contactElements.length} potential contacts on page`);
      
      // Process each contact element
      for (let i = 0; i < contactElements.length; i++) {
        const element = contactElements[i];
        console.log(`\n📋 Processing contact ${i + 1}/${contactElements.length}...`);
        
        try {
          // Extract name with fallbacks
          console.log('  Looking for name element...');
          const nameSelector = await waitForAnySelector(page, SELECTORS.NAME, 1000);
          let name = '';
          
          if (nameSelector) {
            console.log(`  Found name selector: ${nameSelector}`);
            const nameElement = await element.$(nameSelector);
            if (nameElement) {
              name = await extractTextContent(page, nameElement, SELECTORS.NAME);
              console.log(`  ✅ Found name: "${name}"`);
            } else {
              console.log('  ❌ Name element not found');
            }
          } else {
            console.log('  ❌ No suitable name selector found');
            name = await extractTextContent(page, element, SELECTORS.NAME);
            if (name) {
              console.log(`  ✅ Extracted name from parent element: "${name}"`);
            }
          }
          
          if (!name) {
            console.log('  ❌ Could not extract name, skipping this contact');
            continue; // Skip if no name found
          }
          
          // Extract profile URL
          console.log('  Looking for profile link...');
          const profileLinkSelector = await waitForAnySelector(page, SELECTORS.PROFILE_LINK, 1000);
          let linkedinUrl = '';
          
          if (profileLinkSelector) {
            console.log(`  Found profile link selector: ${profileLinkSelector}`);
            const linkElement = await element.$(profileLinkSelector);
            if (linkElement) {
              linkedinUrl = await page.evaluate((el: Element) => {
                const anchor = el as HTMLAnchorElement;
                return anchor.href || '';
              }, linkElement);
              console.log(`  ✅ Found profile URL: ${linkedinUrl.substring(0, 50)}...`);
            } else {
              console.log('  ❌ Profile link element not found');
            }
          } else {
            console.log('  ❌ No suitable profile link selector found');
          }
          
          // Extract other fields
          console.log('  Extracting additional profile data...');
          
          console.log('  - Looking for role information');
          const roleElement = await element.$(SELECTORS.ROLE[0]);
          const role = await extractTextContent(page, roleElement, SELECTORS.ROLE);
          console.log(`  ${role ? '✅' : '❌'} Role: "${role}"`);
          
          console.log('  - Looking for company information');
          const companyElement = await element.$(SELECTORS.COMPANY[0]);
          const company = await extractTextContent(page, companyElement, SELECTORS.COMPANY);
          console.log(`  ${company ? '✅' : '❌'} Company: "${company}"`);
          
          console.log('  - Looking for location information');
          const locationElement = await element.$(SELECTORS.LOCATION[0]);
          const location = await extractTextContent(page, locationElement, SELECTORS.LOCATION);
          console.log(`  ${location ? '✅' : '❌'} Location: "${location}"`);
          
          console.log('  - Looking for connection information');
          const connectionElement = await element.$(SELECTORS.CONNECTION[0]);
          const connection = await extractTextContent(page, connectionElement, SELECTORS.CONNECTION);
          console.log(`  ${connection ? '✅' : '❌'} Connection: "${connection}"`);
          
          console.log('  - Looking for profile picture');
          const profilePicElement = await element.$(SELECTORS.PROFILE_PIC[0]);
          let profilePic = '';
          if (profilePicElement) {
            profilePic = await page.evaluate(el => el?.getAttribute('src') || '', profilePicElement);
            console.log(`  ✅ Found profile picture`);
          } else {
            console.log('  ❌ Profile picture not found');
          }
          
          // Create contact object
          contacts.push({
            name,
            role,
            company,
            location,
            profilePic,
            connection,
            linkedinUrl
          });
          
          console.log(`✅ Successfully extracted data for contact: ${name}`);
        } catch (error) {
          console.log(`❌ Error extracting contact ${i + 1} details:`, error);
          continue; // Skip this contact and continue with the next
        }
      }
      
      console.log(`\n📊 Extraction summary: Found ${contacts.length}/${contactElements.length} valid contacts`);
      
      if (contacts.length === 0 && retries < maxRetries - 1) {
        console.log('⚠️ No valid contacts extracted, retrying...');
        await page.reload({ waitUntil: 'networkidle0' });
        retries++;
      }
      
    } catch (error) {
      console.error('❌ Error during contact extraction:', error);
      if (retries < maxRetries - 1) {
        await page.reload({ waitUntil: 'networkidle0' });
        retries++;
      }
    }
  }
  
  return contacts;
}

// Improved function to navigate to the next page
async function navigateToNextPage(page: Page): Promise<boolean> {
  try {
    const nextButtonSelector = await waitForAnySelector(page, SELECTORS.NEXT_BUTTON);
    if (!nextButtonSelector) {
      console.log('Next button not found');
      return false;
    }
    
    const nextButton = await page.$(nextButtonSelector);
    if (!nextButton) {
      return false;
    }
    
    // Check if button is disabled
    const isDisabled = await page.evaluate(button => {
      return button.hasAttribute('disabled') || 
             button.classList.contains('artdeco-button--disabled');
    }, nextButton);
    
    if (isDisabled) {
      console.log('Next button is disabled');
      return false;
    }
    
    await Promise.all([
      nextButton.click(),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
    ]);
    
    // Verify navigation was successful by checking page number in URL
    const url = await page.url();
    return url.includes('page=');
    
  } catch (error) {
    console.error('Error navigating to next page:', error);
    return false;
  }
}

// Helper function to convert LinkedInContact to Contact
function mapToContact(linkedInContact: LinkedInContact): Contact {
  return {
    id: uuidv4(),
    name: linkedInContact.name,
    role: linkedInContact.role,
    company: linkedInContact.company,
    location: linkedInContact.location,
    profilePicture: linkedInContact.profilePic,
    selected: false,
    linkedinUrl: linkedInContact.linkedinUrl,
    connection: linkedInContact.connection
  };
}

// Update the search route implementation with improved extraction
router.post('/search', auth, async (req: any, res: Response) => {
  let browser: Browser | null = null;
  let page: Page | null = null;
  const allContacts: Contact[] = [];
  let currentPage = 1;

  try {
    const { location, targetRole, seniority } = req.body;
    const campaignId = req.body.campaignId;

    if (!location || !targetRole || !seniority || !campaignId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize browser with stealth plugin
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
      defaultViewport: null,
    });

    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(300000);

    // Navigate to LinkedIn login
    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'networkidle0'
    });

    // Wait for user to manually log in
    console.log('Please log in to LinkedIn and complete any verification steps...');
    
    // Wait for login completion
    let isLoggedIn = false;
    for (let attempts = 0; attempts < 60; attempts++) {
      const currentUrl = await page.url();
      
      if (currentUrl.includes('linkedin.com/feed') || currentUrl.includes('linkedin.com/search/results/people/')) {
        isLoggedIn = true;
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (!isLoggedIn) {
      throw new Error('Failed to complete login process');
    }

    // After login completion
    console.log('Login successful! Now navigating to the search page...');
    
    // Navigate to search page
    await navigateToSearch(page, targetRole, location);
    console.log('✅ Successfully reached search page. Starting contact extraction...');
    
    // Start contact search
    console.log('\n🔍 Starting LinkedIn contact search...');
    
    while (allContacts.length < 50 && currentPage <= 5) { // Limit to 5 pages to prevent infinite loops
      console.log(`\n📄 Processing page ${currentPage}...`);
      
      // Extract contacts using improved function
      const contacts = await extractContacts(page, 3); // Allow up to 3 retries
      
      if (contacts.length > 0) {
        console.log(`\n✅ Successfully extracted ${contacts.length} contacts from page ${currentPage}`);
        
        const mappedContacts = contacts.map(mapToContact);
        console.log('Mapping LinkedIn contacts to standard Contact format...');
        
        const validContacts = mappedContacts.filter(contact => 
          contact.name && contact.name !== 'Not found' && 
          contact.name.length > 1 // Filter out contacts with very short names
        );
        
        console.log(`✅ After filtering: ${validContacts.length} valid contacts`);
        allContacts.push(...validContacts);
        console.log(`📊 Total contacts collected so far: ${allContacts.length}/50`);
      } else {
        console.log(`❌ No contacts found on page ${currentPage}`);
      }
      
      if (allContacts.length >= 50) {
        console.log('🎉 Target of 50 contacts reached!');
        break;
      }
      
      // Try to navigate to next page with improved function
      console.log('\n⏭️ Attempting to navigate to next page...');
      const hasNextPage = await navigateToNextPage(page);
      if (!hasNextPage) {
        console.log('❌ No more pages available');
        break;
      }
      
      currentPage++;
      console.log(`✅ Successfully navigated to page ${currentPage}`);
      
      // Small wait to ensure page is fully loaded
      console.log('Waiting for page to fully load...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n🏁 LinkedIn search completed. Found ${allContacts.length} total contacts`);
    
    // Update campaign with search results
    if (allContacts.length > 0) {
      const searchResults: LinkedInSearchResults = {
        contacts: allContacts.slice(0, 50), // Ensure we only keep 50 contacts
        total: allContacts.length,
        currentPage,
        pageSize: 10,
        totalPages: Math.ceil(allContacts.length / 10),
        searchParams: {
          location,
          targetRole,
          seniority
        },
        lastUpdated: new Date()
      };

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.linkedinSearchResults = searchResults;
      await campaign.save();

      res.json(searchResults);
    } else {
      res.status(400).json({
        error: 'No contacts found',
        details: 'The search did not return any valid contacts'
      });
    }
  } catch (error) {
    console.error('LinkedIn search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform LinkedIn search', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
});

export default router; 