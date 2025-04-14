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
const Campaign_1 = require("../models/Campaign");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create a new campaign
router.post('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requiredFields = ['name', 'description', 'startDate', 'endDate', 'targetRole', 'location', 'seniority', 'outreachType'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }
        const campaign = new Campaign_1.Campaign(Object.assign(Object.assign({}, req.body), { createdBy: req.user._id }));
        yield campaign.save();
        res.status(201).json(campaign);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create campaign' });
    }
}));
// Get all campaigns for the authenticated user
router.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching campaigns for user:', req.user._id);
        const campaigns = yield Campaign_1.Campaign.find({ createdBy: req.user._id });
        console.log('Found campaigns:', campaigns.length);
        res.json(campaigns);
    }
    catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
}));
// Get a specific campaign
router.get('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.Campaign.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(campaign);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
}));
// Update a campaign
router.put('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const campaign = yield Campaign_1.Campaign.findOne({
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
            campaign[update] = req.body[update];
        });
        yield campaign.save();
        console.log('Campaign updated successfully');
        res.json(campaign);
    }
    catch (error) {
        console.error('Error updating campaign:', error);
        res.status(400).json({ error: 'Failed to update campaign' });
    }
}));
// Delete a campaign
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.Campaign.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(campaign);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
}));
exports.default = router;
