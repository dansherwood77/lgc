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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifyLinkedInScraper = void 0;
const apify_client_1 = require("apify-client");
const Campaign_1 = require("../models/Campaign");
class ApifyLinkedInScraper {
    constructor(apiToken) {
        this.client = new apify_client_1.ApifyClient({
            token: apiToken,
        });
    }
    searchProfiles(targetRole, location, seniority) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Prepare the actor input
                const input = {
                    searchQueries: [`${targetRole} ${seniority} in ${location}`],
                    maxItemsPerQuery: 50,
                    extendOutputFunction: ($) => {
                        const result = [];
                        $('.entity-result__item').each((index, element) => {
                            const name = $(element).find('.entity-result__title-text').text().trim();
                            const role = $(element).find('.entity-result__primary-subtitle').text().trim();
                            const company = $(element).find('.entity-result__secondary-subtitle').text().trim();
                            const location = $(element).find('.entity-result__simple-insight-text').text().trim();
                            const profileUrl = $(element).find('a.app-aware-link').attr('href') || '';
                            const profilePicture = $(element).find('.profile-picture').attr('src') || '';
                            if (name && role) {
                                result.push({
                                    name,
                                    role,
                                    company,
                                    location,
                                    profileUrl,
                                    profilePicture
                                });
                            }
                        });
                        return result;
                    }
                };
                // Run the actor
                const run = yield this.client.actor('apify/linkedin-scraper').call(input);
                // Fetch and transform the results
                const { items } = yield this.client.dataset(run.defaultDatasetId).listItems();
                return items.map((item) => ({
                    name: item.name,
                    role: item.role,
                    company: item.company,
                    location: item.location,
                    profileUrl: item.profileUrl,
                    profilePicture: item.profilePicture
                }));
            }
            catch (error) {
                console.error('Error searching LinkedIn with Apify:', error);
                throw error;
            }
        });
    }
    updateCampaignWithResults(campaignId, profiles, searchParams) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const campaign = yield Campaign_1.Campaign.findById(campaignId);
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
                yield campaign.save();
                return contacts;
            }
            catch (error) {
                console.error('Error updating campaign with LinkedIn results:', error);
                throw error;
            }
        });
    }
}
exports.ApifyLinkedInScraper = ApifyLinkedInScraper;
