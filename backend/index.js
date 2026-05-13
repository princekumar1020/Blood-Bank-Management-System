import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import recipientManagementRoutes from './routes/recipientManagement.js';
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donor.js';
import recipientRoutes from './routes/recipient.js';
import adminRoutes from './routes/admin.js';
import inventoryRoutes from './routes/inventory.js';
import donorManagementRoutes from './routes/donorManagement.js';
import complaintRoutes from './routes/complaintRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  const msg = `Incoming request: ${req.method} ${req.originalUrl}\n`;
  console.log(msg);
  process.stdout.write(msg);
  next();
});
// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api/recipient-management', recipientManagementRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bloodbank')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/recipient', recipientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donor-management', donorManagementRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
