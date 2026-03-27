const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();   // load .env variables

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

// REMOVE THIS IN PRODUCTION - Development only bypass
// This sets a default user if no auth token is provided
app.use((req, res, next) => {
    // ALWAYS set a mock user for now, even if token is present
    // because we haven't implemented the login/token generation yet
    req.user = { _id: '65f8a23bc9e3b4001fb12345' }; 
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Atlas Connected");
})
.catch((err) => {
    console.log("Database connection error:", err);
});

// Routes
app.use('/api/donation', require('./routes/donationRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Define the port
const PORT = process.env.PORT || 5000;

// Test Route
app.get('/', (req, res) => {
    res.send('Blood Bank Backend is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
});