const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables (we will create a .env file later)
dotenv.config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
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

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/donor', require('./routes/donor'));
app.use('/api/recipient', require('./routes/recipient'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/donor-management', require('./routes/donorManagement'));
app.use('/api/recipient-management', require('./routes/recipientManagement'));
app.use('/api/users', require('./routes/userRoutes'));

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