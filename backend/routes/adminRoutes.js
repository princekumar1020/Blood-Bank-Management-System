import express from "express";
import Donor from "../models/Donor.js";
import Inventory from "../models/Inventory.js";

const router = express.Router();


// 🔥 1. GET all donors (admin view)
router.get("/donors", async (req, res) => {
  const donors = await Donor.find();
  res.json(donors);
});


// 🔥 2. APPROVE + SCHEDULE donor
router.post("/approve/:id", async (req, res) => {
  try {
    const { tokenNumber, appointmentTime } = req.body;

    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    donor.status = "approved";
    donor.tokenNumber = tokenNumber;
    donor.appointmentTime = appointmentTime;

    await donor.save();

    res.json({
      message: "Donor approved & scheduled",
      donor
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔥 3. MARK AS DONATED + UPDATE INVENTORY
router.post("/donated/:id", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    if (donor.status !== "approved") {
      return res.status(400).json({
        message: "Donor must be approved first"
      });
    }

    // 🩸 Inventory update
    let item = await Inventory.findOne({ bloodGroup: donor.bloodGroup });

    if (item) {
      item.units += donor.units;
    } else {
      item = new Inventory({
        bloodGroup: donor.bloodGroup,
        units: donor.units || 1
      });
    }

    await item.save();

    // ✅ update donor status
    donor.status = "donated";
    await donor.save();

    res.json({
      message: "Donation completed & inventory updated",
      donor,
      inventory: item
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;