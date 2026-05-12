import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas'))
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:');
        console.error(error);
        // Exit the process with an error code if we can't connect
        process.exit(1);
    });

// Initialize the Express application
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

import authRoutes from './routes/auth.js';
import requestsRoutes from './routes/requests.js';

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestsRoutes);

// Define the port (defaults to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// Test Route
app.get('/', (req, res) => {
    res.send('Blood Bank Backend is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
});