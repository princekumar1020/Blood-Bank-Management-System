import express from "express";
import Donor from "../models/Donor.js";
import Inventory from "../models/Inventory.js";
import Donation from "../models/Donation.js";

const router = express.Router();

// 🔥 STATS endpoint for dashboard
router.get("/stats", async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const pendingRequests = await Donor.countDocuments({ status: "pending" });
    const inventory = await Inventory.find();
    const totalBloodUnits = inventory.reduce((sum, item) => sum + item.units, 0);

    // If no donors/inventory, fall back to donation-based stats
    if (totalDonors === 0 && totalBloodUnits === 0) {
      const allDonations = await Donation.find();
      const totalDonations = allDonations.length;
      const pendingDonations = allDonations.filter(d => d.status === 'pending').length;
      const completedDonations = allDonations.filter(d => d.status === 'completed').length;

      res.json({
        totalDonors: totalDonations,
        totalBloodUnits: completedDonations,
        pendingRequests: pendingDonations
      });
    } else {
      res.json({
        totalDonors,
        totalBloodUnits,
        pendingRequests
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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