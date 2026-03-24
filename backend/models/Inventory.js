import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    unique: true
  },
  units: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("Inventory", inventorySchema);