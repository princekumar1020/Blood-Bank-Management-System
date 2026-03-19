import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  bloodGroup: String,
  units: { type: Number, default: 0 }
});

export default mongoose.model("Inventory", inventorySchema);