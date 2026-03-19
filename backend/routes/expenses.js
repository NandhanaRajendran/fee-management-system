const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ CLOUDINARY CONFIG (uses .env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ MULTER + CLOUDINARY STORAGE
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mess-bills",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

const upload = multer({ storage });

// ✅ GET all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({});
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ POST — bill optional for staff charges
router.post("/", upload.single("bill"), async (req, res) => {
  try {
    const isStaff = req.body.isStaff === "true" || req.body.isStaff === true;

    if (!isStaff && !req.file) {
      return res.status(400).json({ message: "Bill is required" });
    }

    if (req.body.isCommon === "true" && !req.body.description) {
      return res.status(400).json({ message: "Description required for extra charges" });
    }

    const expense = new Expense({
      title:     req.body.title,
      amount:    req.body.amount,
      date:      req.body.date,
      billMonth: req.body.billMonth,
      bill:      req.file ? req.file.path : null,  // Cloudinary URL
      isCommon:  req.body.isCommon === "true",
      isStaff:   isStaff,
      quantity:  req.body.quantity || "",
    });

    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// ✅ DELETE — also removes from Cloudinary
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.bill) {
      try {
        const urlParts = expense.bill.split("/");
        const fileWithExt = urlParts[urlParts.length - 1];
        const fileName = fileWithExt.split(".")[0];
        const publicId = `mess-bills/${fileName}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr.message);
      }
    }

    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;