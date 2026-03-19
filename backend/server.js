import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import requestRoutes from './routes/requestRoutes.js';

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- 2. DATABASE CONNECTION (Prince's DB) ---
// Note: # ko %23 likha hai connection string stable rakhne ke liye
const MONGO_URI = "mongodb+srv://princekumar92430_db_user:Mongo%232498@building-database.efe2ro1.mongodb.net/bloodbank?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Prince's MongoDB Connected Successfully! 🎉"))
    .catch((err) => console.error("❌ Connection Failed:", err.message));

// --- 3. ROUTES ---
app.use('/api/requests', requestRoutes);

// --- 4. SERVER START ---
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});