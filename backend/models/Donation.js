import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  bloodGroup: String,
  units: { type: Number, default: 1 },
  status: { type: String, default: "pending" },
  tokenNumber: String,
  appointmentTime: String
});

export default mongoose.model("Donation", donationSchema);