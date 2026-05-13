import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ALL ROUTE IMPORTS (Aapke aur Priyanshu dono ke) ---
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donor.js';
import recipientRoutes from './routes/recipient.js';
import adminRoutes from './routes/admin.js';
import inventoryRoutes from './routes/inventory.js';
import donorManagementRoutes from './routes/donorManagement.js';
import recipientManagementRoutes from './routes/recipientManagement.js';
import complaintRoutes from './routes/complaintRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import requestsRoutes from './routes/requests.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Logging Middleware
app.use((req, res, next) => {
  const msg = `Incoming request: ${req.method} ${req.originalUrl}\n`;
  console.log(msg);
  process.stdout.write(msg);
  next();
});

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Database Connection (Safe fallback logic)
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost/bloodbank')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
  });

// --- ALL ROUTE DEFINITIONS ---
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/recipient', recipientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donor-management', donorManagementRoutes);
app.use('/api/recipient-management', recipientManagementRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/users', userRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Blood Bank Backend is running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running beautifully on port ${PORT}`));