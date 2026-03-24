const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables (we will create a .env file later)
dotenv.config();

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

// Middleware to parse JSON data and allow cross-origin requests
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));

// Define the port (defaults to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// A basic test route
app.get('/', (req, res) => {
    res.send('Blood Bank Backend is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
});