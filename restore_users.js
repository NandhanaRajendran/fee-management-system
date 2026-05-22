const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

const User = require("./backend/models/User");
const Department = require("./backend/models/Department");
const FeeSection = require("./backend/models/FeeSection");

async function restoreUsers() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);

    // 1. Ensure Admin exists
    const admin = await User.findOne({ username: "admin" });
    if (!admin) {
      await User.create({
        username: "admin",
        password: "1234",
        role: "admin"
      });
      console.log("Restored admin");
    }

    // 2. Restore HODs and Staff Advisors from Departments
    const depts = await Department.find({});
    for (const d of depts) {
      if (d.username && d.password) {
        const u = await User.findOne({ username: d.username });
        if (!u) {
          await User.create({
            username: d.username,
            password: d.password,
            role: "hod",
            refId: d._id,
            refModel: "Department"
          });
          console.log(`Restored HOD for ${d.name}`);
        }
      }
      
      if (d.advisorCredentials && Array.isArray(d.advisorCredentials)) {
        for (const adv of d.advisorCredentials) {
          if (adv.username && adv.password) {
            const u = await User.findOne({ username: adv.username });
            if (!u) {
              await User.create({
                username: adv.username,
                password: adv.password,
                role: "staffAdvisor",
                refId: d._id,
                refModel: "Department"
              });
              console.log(`Restored Advisor ${adv.username} for ${d.name}`);
            }
          }
        }
      }
    }

    // 3. Restore Fee Managers from FeeSections
    const sections = await FeeSection.find({});
    for (const s of sections) {
       if (s.username && s.password) {
         const u = await User.findOne({ username: s.username });
         if (!u) {
           let role = "feeManager";
           if (s.name === "Mess") role = "feeManager"; // or whatever the mess manager role is
           
           await User.create({
             username: s.username,
             password: s.password,
             role: role,
             refId: s._id,
             refModel: "FeeSection"
           });
           console.log(`Restored Fee Manager for ${s.name}`);
         }
       }
    }

    console.log("Non-student users restoration complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

restoreUsers();
