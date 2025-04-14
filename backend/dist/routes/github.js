"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const axios_1 = __importDefault(require("axios"));
const Campaign_1 = require("../models/Campaign");
const router = express_1.default.Router();
router.post('/search', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { targetRole, location, seniority, campaignId } = req.body;
        if (!targetRole || !location || !seniority || !campaignId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Search GitHub users based on the criteria
        const searchQuery = `location:${location} language:${getLanguageFromRole(targetRole)}`;
        const response = yield axios_1.default.get(`https://api.github.com/search/users?q=${encodeURIComponent(searchQuery)}`, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const users = response.data.items;
        const detailedUsers = [];
        // Get detailed information for each user
        for (const user of users.slice(0, 10)) { // Limit to 10 users for now
            const userResponse = yield axios_1.default.get(`https://api.github.com/users/${user.login}`, {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            const contributionsResponse = yield axios_1.default.get(`https://api.github.com/users/${user.login}/contributions`, {
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
        yield Campaign_1.Campaign.findByIdAndUpdate(campaignId, {
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
    }
    catch (error) {
        console.error('GitHub search error:', error);
        res.status(500).json({ error: 'Failed to search GitHub' });
    }
}));
function getLanguageFromRole(role) {
    const roleToLanguage = {
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
exports.default = router;
