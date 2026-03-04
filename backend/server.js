const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (we will create a .env file later)
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware to parse JSON data and allow cross-origin requests
app.use(express.json());
app.use(cors());

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