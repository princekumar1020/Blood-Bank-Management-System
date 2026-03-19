import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import donationRoutes from "./routes/donationRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

console.log("MONGO URI:", process.env.MONGO_URI);

app.use("/api/donations", donationRoutes);

app.get("/", (req, res) => {
  res.send("Server working");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log("❌ DB Error:", err.message));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});