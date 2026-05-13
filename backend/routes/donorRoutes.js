import express from "express";
import {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  approveDonor,
  completeDonation,
  searchDonors,
  getDonorsByStatus
} from "../controllers/donorController.js";

const router = express.Router();

// 📌 SEARCH donors (must come before /:id)
router.get("/search/query", searchDonors);

// 📌 GET donors by status (must come before /:id)
router.get("/status/:status", getDonorsByStatus);

// 📌 GET all donors
router.get("/", getAllDonors);

// 📌 GET single donor
router.get("/:id", getDonorById);

// 📌 CREATE new donor
router.post("/", createDonor);

// 📌 UPDATE donor
router.put("/:id", updateDonor);

// 📌 DELETE donor
router.delete("/:id", deleteDonor);

// 📌 APPROVE donor
router.post("/:id/approve", approveDonor);

// 📌 MARK donation as completed
router.post("/:id/complete", completeDonation);

export default router;
