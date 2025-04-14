import express from 'express';
import { auth } from '../middleware/auth';
import axios from 'axios';
import { Campaign } from '../models/Campaign';

const router = express.Router();

interface GitHubUser {
  login: string;
  name: string;
  company: string;
  location: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  public_repos: number;
}

router.post('/search', auth, async (req, res) => {
  try {
    const { targetRole, location, seniority, campaignId } = req.body;

    if (!targetRole || !location || !seniority || !campaignId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Search GitHub users based on the criteria
    const searchQuery = `location:${location} language:${getLanguageFromRole(targetRole)}`;
    const response = await axios.get(`https://api.github.com/search/users?q=${encodeURIComponent(searchQuery)}`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const users = response.data.items;
    const detailedUsers: GitHubUser[] = [];

    // Get detailed information for each user
    for (const user of users.slice(0, 10)) { // Limit to 10 users for now
      const userResponse = await axios.get(`https://api.github.com/users/${user.login}`, {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const contributionsResponse = await axios.get(`https://api.github.com/users/${user.login}/contributions`, {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      detailedUsers.push({
        login: user.login,
        name: userResponse.data.name || user.login,
        company: userResponse.data.company || 'Not specified',
        location: userResponse.data.location || 'Not specified',
        avatar_url: userResponse.data.avatar_url,
        html_url: userResponse.data.html_url,
        contributions: contributionsResponse.data.total || 0,
        public_repos: userResponse.data.public_repos
      });
    }

    // Update the campaign with the search results
    const contacts = detailedUsers.map(user => ({
      name: user.name,
      role: targetRole,
      company: user.company,
      location: user.location,
      profilePicture: user.avatar_url,
      selected: false,
      githubUrl: user.html_url,
      contributions: user.contributions,
      repositories: user.public_repos
    }));

    await Campaign.findByIdAndUpdate(campaignId, {
      $set: {
        githubSearchResults: {
          contacts,
          total: contacts.length,
          currentPage: 1,
          pageSize: 10,
          totalPages: Math.ceil(contacts.length / 10),
          searchParams: {
            location,
            targetRole,
            seniority
          },
          lastUpdated: new Date()
        }
      }
    });

    res.json({ contacts });
  } catch (error) {
    console.error('GitHub search error:', error);
    res.status(500).json({ error: 'Failed to search GitHub' });
  }
});

function getLanguageFromRole(role: string): string {
  const roleToLanguage: { [key: string]: string } = {
    'React Developer': 'JavaScript',
    'Python Engineer': 'Python',
    'Java Developer': 'Java',
    'Backend Developer': 'Python,Java,Go',
    'Frontend Developer': 'JavaScript,TypeScript',
    'Full Stack Developer': 'JavaScript,Python,Java',
    'DevOps Engineer': 'Python,Shell',
    'Data Scientist': 'Python,R',
    'Machine Learning Engineer': 'Python',
    'Mobile Developer': 'Swift,Kotlin'
  };

  return roleToLanguage[role] || 'JavaScript';
}

export default router; 