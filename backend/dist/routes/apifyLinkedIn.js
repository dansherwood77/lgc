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
const apifyLinkedInScraper_1 = require("../services/apifyLinkedInScraper");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Initialize the scraper with API token
const scraper = new apifyLinkedInScraper_1.ApifyLinkedInScraper(process.env.APIFY_API_TOKEN || '');
// Search LinkedIn profiles
router.post('/search', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { targetRole, location, seniority } = req.body;
        if (!targetRole || !location || !seniority) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        console.log('Starting LinkedIn search process...');
        console.log('Search parameters:', { targetRole, location, seniority });
        // Search profiles
        const profiles = yield scraper.searchProfiles(targetRole, location, seniority);
        console.log(`Found ${profiles.length} profiles`);
        res.json({ profiles });
    }
    catch (error) {
        console.error('LinkedIn search error:', error);
        res.status(500).json({ error: 'Failed to search LinkedIn' });
    }
}));
// Update campaign with search results
router.post('/update-campaign', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { campaignId, profiles, searchParams } = req.body;
        if (!campaignId || !profiles || !searchParams) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        const contacts = yield scraper.updateCampaignWithResults(campaignId, profiles, searchParams);
        res.json({ contacts });
    }
    catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
}));
exports.default = router;
