import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'APIFY_API_TOKEN', 'LINKEDIN_COOKIE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Log environment variable status
console.log('Environment variables status:');
console.log('- APIFY_API_TOKEN:', process.env.APIFY_API_TOKEN ? 'Set' : 'Missing');
console.log('- LINKEDIN_COOKIE:', process.env.LINKEDIN_COOKIE ? 'Set' : 'Missing');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');

import userRoutes from './routes/user';
import campaignRoutes from './routes/campaign';
import apifyLinkedInRoutes from './routes/apifyLinkedIn';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/linkedin', apifyLinkedInRoutes);

// Connect to MongoDB
console.log('Attempting to connect to MongoDB at:', process.env.MONGODB_URI || 'mongodb://localhost:27017/lgc');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lgc')
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('MongoDB connection details:', mongoose.connection.host, mongoose.connection.port, mongoose.connection.name);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if we can't connect to the database
  });

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on Mongod port ${PORT}`);
}); 