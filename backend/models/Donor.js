
import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  name: String,
  bloodGroup: String,

  status: {
    type: String,
    default: "pending"
  },

  tokenNumber: Number,
  appointmentTime: String,

  units: {
    type: Number,
    default: 1
  }
});

export default mongoose.model("Donor", donorSchema);