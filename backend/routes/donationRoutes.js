import express from "express";
import {
  getDonations,
  createDonation,
  approveDonation,
  completeDonation
} from "../controllers/donationController.js";

const router = express.Router();

router.get("/", getDonations);
router.post("/create", createDonation);
router.post("/approve/:id", approveDonation);
router.post("/complete/:id", completeDonation);

export default router;