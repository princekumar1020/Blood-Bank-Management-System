import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import donationRoutes from "./routes/donationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import Inventory from "./models/Inventory.js";



dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

app.use(express.json());
app.use(cors());

console.log("MONGO URI:", process.env.MONGO_URI);

app.use("/api/donations", donationRoutes);
app.use("/api/donors", donorRoutes);
app.use("/admin", adminRoutes);

app.get("/api", (req, res) => {
  res.json({ 
    message: "Blood Bank Management System API",
    version: "1.0.0",
    routes: {
      donations: "/api/donations",
      donors: "/api/donors",
      admin: "/admin"
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server working");
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log("✅ DB Connected");

    // Initialize blood inventory for all blood groups if not exist
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    for (const group of bloodGroups) {
      await Inventory.findOneAndUpdate(
        { bloodGroup: group },
        { bloodGroup: group },
        { upsert: true, new: true }
      );
    }
    console.log("✅ Inventory initialized");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

startServer();