
import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  age: Number,
  gender: String,
  address: String,
  bloodGroup: String,

  // Medical Information
  weight: Number,
  bloodPressure: String,
  hemoglobin: Number,
  healthConditions: String,
  lastDonationDate: Date,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed", "cancelled"],
    default: "pending"
  },

  tokenNumber: Number,
  appointmentTime: String,
  notes: String,

  units: {
    type: Number,
    default: 1
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Donor", donorSchema);