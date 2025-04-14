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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
// Register a new user
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, linkedinEmail, linkedinPassword } = req.body;
        console.log('Received registration request with data:', {
            firstName,
            lastName,
            email,
            linkedinEmail,
            hasPassword: !!password,
            hasLinkedinPassword: !!linkedinPassword
        });
        // Check each field individually and collect missing fields
        const missingFields = [];
        if (!firstName)
            missingFields.push('firstName');
        if (!lastName)
            missingFields.push('lastName');
        if (!email)
            missingFields.push('email');
        if (!password)
            missingFields.push('password');
        if (!linkedinEmail)
            missingFields.push('linkedinEmail');
        if (!linkedinPassword)
            missingFields.push('linkedinPassword');
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                error: 'All fields are required',
                missingFields
            });
        }
        console.log('Checking for existing user with email:', email);
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }
        console.log('Creating new user with email:', email);
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_1.User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            linkedinEmail,
            linkedinPassword
        });
        console.log('Saving user to database...');
        yield user.save();
        console.log('User saved successfully');
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                linkedinEmail: user.linkedinEmail
            },
            token
        });
    }
    catch (error) {
        console.error('Registration error details:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to register user', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to register user' });
        }
    }
}));
// Login user
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        // Validate required fields
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = yield User_1.User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log('Comparing passwords...');
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Login successful, token generated');
        // Return user data without password
        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
        res.json({ user: userResponse, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
}));
// Get user profile
router.get('/profile', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
}));
// Update user profile
router.put('/profile', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allowedUpdates = ['firstName', 'lastName', 'email', 'currentPassword', 'newPassword', 'confirmPassword'];
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        if (updates.includes('currentPassword') && updates.includes('newPassword') && updates.includes('confirmPassword')) {
            const user = yield User_1.User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const isMatch = yield bcryptjs_1.default.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
            if (req.body.newPassword !== req.body.confirmPassword) {
                return res.status(400).json({ error: 'New passwords do not match' });
            }
            user.password = yield bcryptjs_1.default.hash(req.body.newPassword, 10);
            yield user.save();
            return res.json({ message: 'Password updated successfully' });
        }
        const user = yield User_1.User.findByIdAndUpdate(req.user._id, { $set: updates.reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [key]: req.body[key] })), {}) }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}));
// Logout user
router.post('/logout', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real application, you might want to invalidate the token
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
}));
exports.default = router;
