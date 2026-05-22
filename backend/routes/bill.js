const express = require("express");
const router = express.Router();
const MonthlyBill = require("../models/MonthlyBill");
const Due = require("../models/Due");


router.get("/all-dues", async (req, res) => {
  try {

    const dues = await Due.find({
  remark: /Mess Bill/i
}).populate("student");

// Apply overdue fine only once
for (const due of dues) {

  if (
    due.status === "pending" &&
    due.dueDate &&
    new Date() > new Date(due.dueDate) &&
    !due.fineApplied
  ) {

    due.amount += 100;

    due.fineApplied = true;

    await due.save();
  }
}

    res.json(dues);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get("/all-bills", async (req, res) => {
  try {
    const bills = await MonthlyBill.find();
    res.json(bills);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});
router.post("/unpublish", async (req, res) => {
  try {

    const { month } = req.body;

    await MonthlyBill.updateOne(
      { month },
      {
        $set: {
          published: false,
          publishedAt: null,
          drafted: false,
          draftedAt: null,
        },
      }
    );

    const FeeSection = require("../models/FeeSection");

    const messFs = await FeeSection.findOne({
      name: "Mess"
    });

    if (messFs) {

      // Remove published dues
      await Due.deleteMany({
        feeSection: messFs._id,
        remark: `${month} Mess Bill`
      });

      // Remove draft dues
      await Due.deleteMany({
        feeSection: messFs._id,
        remark: `${month} Mess Bill Draft`
      });
    }

    res.json({
      success: true,
      message: "Bill unpublished successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to unpublish",
    });
  }
});
// GET status for a month
router.get("/:month", async (req, res) => {
  try {
    const doc = await MonthlyBill.findOne({ month: req.params.month });
    res.json(doc || { month: req.params.month, drafted: false, published: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — send draft
router.post("/draft", async (req, res) => {
  try {
    const { month, bills } = req.body;

    if (!month) {
      return res.status(400).json({
        message: "Month is required"
      });
    }

    // Save draft status
    const doc = await MonthlyBill.findOneAndUpdate(
      { month },
      {
        drafted: true,
        draftedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    // Create draft dues
    if (bills && bills.length > 0) {

      const FeeSection = require("../models/FeeSection");

      let messFs = await FeeSection.findOne({
        name: "Mess"
      });

      if (!messFs) {
        messFs = await FeeSection.create({
          name: "Mess",
          applicableDepartments: []
        });
      }

      // Remove old draft dues
      await Due.deleteMany({
        feeSection: messFs._id,
        remark: `${month} Mess Bill Draft`
      });

      for (const b of bills) {

        if (b.amount > 0) {

          await Due.create({
            student: b.studentId,
            feeSection: messFs._id,
            amount: b.amount,
            dueDate: null,
            status: "draft",
            remark: `${month} Mess Bill Draft`,
            addedBy: "messManager",

            meta: {
              attendanceDays: b.days,
              foodBill: b.foodBill,
              staffShare: b.staffShare,
              foodRatePerDay: b.foodRatePerDay
            }

          });

        }
      }
    }

    res.json(doc);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// POST — publish (only allowed if drafted first)
router.post("/publish", async (req, res) => {
  try {
    const { month, bills } = req.body;
    if (!month) return res.status(400).json({ message: "Month is required" });

    const existing = await MonthlyBill.findOne({ month });
    if (!existing?.drafted) {
      return res.status(400).json({ message: "Draft must be sent before publishing" });
    }

    const doc = await MonthlyBill.findOneAndUpdate(
      { month },
      { published: true, publishedAt: new Date() },
      { new: true }
    );

    // Save dues
    if (bills && bills.length > 0) {
      const FeeSection = require("../models/FeeSection");
      const Due = require("../models/Due");
      let messFs = await FeeSection.findOne({ name: "Mess" });
      if (!messFs) {
        messFs = await FeeSection.create({ name: "Mess", applicableDepartments: [] });
      }

      // Remove any existing mess dues for this month to prevent duplicates
      await Due.deleteMany({ feeSection: messFs._id, remark: `${month} Mess Bill` });
      await Due.deleteMany({
        feeSection: messFs._id,
        remark: `${month} Mess Bill Draft`
      });
      for (let b of bills) {

        if (b.amount > 0) {

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 10);

          await Due.create({
            student: b.studentId,
            feeSection: messFs._id,
            amount: b.amount,
            dueDate: dueDate,
            status: "pending",
            remark: `${month} Mess Bill`,
            addedBy: "messManager"
          });

        }
      }
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — regenerate dues for a published month
// router.post("/regenerate-dues", async (req, res) => {
//   try {
//     const { month, bills } = req.body;
//     if (!month) return res.status(400).json({ message: "Month is required" });

//     const existing = await MonthlyBill.findOne({ month });
//     if (!existing?.published) {
//       return res.status(400).json({ message: "Bill must be published first" });
//     }

//     if (!bills || bills.length === 0) {
//       return res.status(400).json({ message: "No bills provided" });
//     }

//     const FeeSection = require("../models/FeeSection");
//     const Due = require("../models/Due");
//     let messFs = await FeeSection.findOne({ name: "Mess" });
//     if (!messFs) {
//       messFs = await FeeSection.create({ name: "Mess", applicableDepartments: [] });
//     }

//     // Remove any existing mess dues for this month
//     await Due.deleteMany({ feeSection: messFs._id, remark: `${month} Mess Bill` });

//     let created = 0;
//     for (let b of bills) {
//       if (b.amount > 0) {
//         await Due.create({
//           student: b.studentId,
//           feeSection: messFs._id,
//           amount: b.amount,
//           dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//           status: "pending",
//           remark: `${month} Mess Bill`,
//           addedBy: "messManager"
//         });
//         created++;
//       }
//     }

//     res.json({ message: `Regenerated ${created} dues for ${month}`, count: created });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



// GET — list of dues for "Mess"
router.get("/dues/list", async (req, res) => {
  try {
    const { month } = req.query;
    const FeeSection = require("../models/FeeSection");
    const Due = require("../models/Due");
    const messFs = await FeeSection.findOne({ name: "Mess" });
    if (!messFs) return res.json([]);

    const query = { feeSection: messFs._id, status: "pending" };
    if (month) {
      query.remark = `${month} Mess Bill`;
    }

    const dues = await Due.find(query)
      .populate({
        path: "student",
        select: "name admissionNo className batch room",
      });

    res.json(dues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




module.exports = router;