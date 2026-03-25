import Donor from "../models/Donor.js";
import Inventory from "../models/Inventory.js";

// 📌 GET all donors
export const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 GET single donor
export const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 CREATE new donor
export const createDonor = async (req, res) => {
  try {
    const { name, email, phone, age, gender, address, bloodGroup, weight, bloodPressure, hemoglobin, healthConditions, notes } = req.body;

    const newDonor = new Donor({
      name,
      email,
      phone,
      age,
      gender,
      address,
      bloodGroup,
      weight,
      bloodPressure,
      hemoglobin,
      healthConditions,
      notes,
      status: "pending"
    });

    await newDonor.save();
    res.status(201).json({ message: "Donor added successfully", donor: newDonor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 UPDATE donor
export const updateDonor = async (req, res) => {
  try {
    const { name, email, phone, age, gender, address, bloodGroup, weight, bloodPressure, hemoglobin, healthConditions, notes, status } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        age,
        gender,
        address,
        bloodGroup,
        weight,
        bloodPressure,
        hemoglobin,
        healthConditions,
        notes,
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ message: "Donor updated successfully", donor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 DELETE donor
export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ message: "Donor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 APPROVE + SCHEDULE donor
export const approveDonor = async (req, res) => {
  try {
    const { tokenNumber, appointmentTime } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        tokenNumber,
        appointmentTime,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ message: "Donor approved", donor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 MARK donation as COMPLETED + Update Inventory
export const completeDonation = async (req, res) => {
  try {
    const { bloodType, unitsCollected } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        lastDonationDate: new Date(),
        units: unitsCollected,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Update inventory
    let inventory = await Inventory.findOne({ bloodType });
    if (inventory) {
      inventory.units += unitsCollected;
      await inventory.save();
    } else {
      await Inventory.create({ bloodType, units: unitsCollected });
    }

    res.json({ message: "Donation completed", donor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 SEARCH donors
export const searchDonors = async (req, res) => {
  try {
    const { query } = req.query;

    const donors = await Donor.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { bloodGroup: { $regex: query, $options: "i" } }
      ]
    });

    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 GET donors by status
export const getDonorsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const donors = await Donor.find({ status }).sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
