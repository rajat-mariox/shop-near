/**
 * Seed Script - Create Default Admin User
 * Run this script to create an admin user in the database
 *
 * Usage: node scripts/seedAdmin.js
 *
 * Default credentials:
 *   Email:    admin@shopnear.com
 *   Password: Admin@2025
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Load model
const Admin = require("../src/models/Admin");

// MongoDB connection
const MONGODB_URI =
  process.env.LOCAL_MONGO_DB

const DEFAULT_ADMINS = [
  {
    name: "Super Admin",
    email: "admin@shopnear.com",
    password: "Admin@2025",
  },
];

async function hashPassword(password) {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

async function seedAdmins() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    for (const admin of DEFAULT_ADMINS) {
      const email = admin.email.toLowerCase();
      const existing = await Admin.findOne({ email });

      const hashedPassword = await hashPassword(admin.password);

      if (existing) {
        // Reset password to the default so login works
        existing.password = hashedPassword;
        existing.name = admin.name;
        await existing.save();
        console.log(`✓ Admin password reset: ${email}`);
        skipped++;
        continue;
      }

      await Admin.create({
        name: admin.name,
        email: email,
        password: hashedPassword,
      });

      console.log(`✓ Admin created: ${email}`);
      created++;
    }

    console.log(
      `\n✅ Seeding complete — Created: ${created}, Skipped: ${skipped}`,
    );
    console.log("\n  Login credentials:");
    DEFAULT_ADMINS.forEach((a) => {
      console.log(`    Email:    ${a.email}`);
      console.log(`    Password: ${a.password}`);
    });
  } catch (err) {
    console.error("✗ Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n✓ Disconnected from MongoDB");
  }
}

seedAdmins();
