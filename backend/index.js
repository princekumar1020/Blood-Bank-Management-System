import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
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
import communityRoutes from './routes/community.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

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
app.use('/api/community', communityRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Blood Bank Backend is running!');
});

// Start Server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const userSockets = new Map();
app.locals.io = io;
app.locals.userSockets = userSockets;

const broadcastActiveUsers = () => {
  const activeCounts = { donors: 0, recipients: 0 };
  for (const [, { role }] of userSockets) {
    if (role === 'donor') activeCounts.donors += 1;
    if (role === 'recipient') activeCounts.recipients += 1;
  }
  io.emit('activeUsers', activeCounts);
  return activeCounts;
};

const addSocketForUser = (userId, role, socketId) => {
  if (!userId || !role) return;
  const existing = userSockets.get(userId);
  if (existing) {
    existing.socketIds.add(socketId);
    return;
  }
  userSockets.set(userId, { role, socketIds: new Set([socketId]) });
};

const removeSocketForUser = (userId, socketId) => {
  if (!userId) return;
  const existing = userSockets.get(userId);
  if (!existing) return;
  existing.socketIds.delete(socketId);
  if (!existing.socketIds.size) {
    userSockets.delete(userId);
  }
};

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded?.user?.id;
    socket.data.role = decoded?.user?.role;
  } catch (err) {
    // ignore invalid token for guest connections
  }
  return next();
});

io.on('connection', (socket) => {
  const { userId, role } = socket.data;
  if (userId && role) {
    addSocketForUser(userId, role, socket.id);
    socket.join(userId);
    const currentCounts = broadcastActiveUsers();
    socket.emit('activeUsers', currentCounts);
  }

  socket.on('disconnect', () => {
    if (userId) {
      removeSocketForUser(userId, socket.id);
      broadcastActiveUsers();
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running beautifully on port ${PORT}`));