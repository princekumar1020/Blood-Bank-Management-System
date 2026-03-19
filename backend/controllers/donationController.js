import Donation from "../models/Donation.js";
import Inventory from "../models/Inventory.js";

export const getDonations = async (req, res) => {
  const data = await Donation.find();
  res.json(data);
};

export const createDonation = async (req, res) => {
  const donation = new Donation({ bloodGroup: "A+" });
  await donation.save();
  res.json(donation);
};

export const approveDonation = async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  donation.status = "approved";
  donation.tokenNumber = "T" + Math.floor(Math.random() * 1000);
  donation.appointmentTime = "10:00 AM";

  await donation.save();
  res.json(donation);
};

export const completeDonation = async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  donation.status = "completed";
  await donation.save();

  let blood = await Inventory.findOne({ bloodGroup: donation.bloodGroup });

  if (blood) {
    blood.units += donation.units;
  } else {
    blood = new Inventory({
      bloodGroup: donation.bloodGroup,
      units: donation.units
    });
  }

  await blood.save();

  res.json({ message: "Completed + Inventory Updated" });
};