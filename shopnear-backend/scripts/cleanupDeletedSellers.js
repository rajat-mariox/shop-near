/**
 * Cleanup Script - Permanently remove soft-deleted sellers
 *
 * Purane soft-delete (isDeleted:true) waale sellers DB me pade reh jaate the.
 * Ye script un sab ko permanently hata deta hai. LOCAL DB par chalta hai.
 *
 * Usage: node scripts/cleanupDeletedSellers.js
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.LOCAL_MONGO_DB;

async function cleanup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to:", MONGODB_URI);

    const S = mongoose.connection.db.collection("sellers");

    const toDelete = await S.find(
      { isDeleted: true },
      { projection: { shopName: 1, fullName: 1, email: 1 } }
    ).toArray();

    console.log(`\nFound ${toDelete.length} soft-deleted sellers:`);
    toDelete.forEach((d) =>
      console.log(`  - ${d.shopName || "(blank shop)"} | ${d.email || "(no email)"}`)
    );

    if (toDelete.length === 0) {
      console.log("Kuch delete karne ko nahi. Exiting.");
      process.exit(0);
    }

    const res = await S.deleteMany({ isDeleted: true });
    console.log(`\nPermanently deleted: ${res.deletedCount}`);

    const total = await S.countDocuments({});
    const remaining = await S.find(
      {},
      { projection: { shopName: 1, isDeleted: 1 } }
    ).toArray();
    console.log(`Sellers remaining in DB: ${total}`);
    remaining.forEach((d) =>
      console.log(`  - ${d.shopName || "(blank)"} | isDeleted: ${d.isDeleted}`)
    );

    process.exit(0);
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  }
}

cleanup();
