/**
 * Cleanup Script - Orphan products (jinka seller ab DB me nahi hai)
 *
 * Seller delete hone par products DB me reh jaate the. Ye script un products ko
 * permanently hata deta hai jinka sellerId kisi bhi maujood seller se match nahi karta.
 * Surviving sellers ke products safe rehte hain. LOCAL DB par chalta hai.
 *
 * Usage:
 *   node scripts/cleanupOrphanProducts.js          -> sirf dikhata hai (dry run, kuch delete nahi)
 *   node scripts/cleanupOrphanProducts.js --delete -> orphan products permanently delete
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.LOCAL_MONGO_DB;
const DO_DELETE = process.argv.includes("--delete");

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to:", MONGODB_URI);

    const P = mongoose.connection.db.collection("products");
    const S = mongoose.connection.db.collection("sellers");

    const sellers = await S.find({}).toArray();
    const liveIds = new Set(sellers.map((s) => String(s._id)));
    console.log("Surviving seller ids:", [...liveIds]);

    const prods = await P.find(
      {},
      { projection: { name: 1, productName: 1, sellerId: 1, isDeleted: 1, isActive: 1 } }
    ).toArray();

    const orphanIds = [];
    console.log(`\nProducts (${prods.length}):`);
    prods.forEach((p) => {
      const sid = String(p.sellerId);
      const orphan = !liveIds.has(sid);
      if (orphan) orphanIds.push(p._id);
      console.log(
        `  - ${p.name || p.productName || "(no name)"} | sellerId: ${sid} | isDeleted: ${p.isDeleted} | isActive: ${p.isActive}${orphan ? "   <== ORPHAN" : "   (seller alive)"}`
      );
    });

    console.log(`\nOrphan products found: ${orphanIds.length}`);

    if (!DO_DELETE) {
      console.log("Dry run. Delete karne ke liye:  node scripts/cleanupOrphanProducts.js --delete");
      process.exit(0);
    }

    if (orphanIds.length === 0) {
      console.log("Kuch delete karne ko nahi.");
      process.exit(0);
    }

    const res = await P.deleteMany({ _id: { $in: orphanIds } });
    console.log(`Permanently deleted orphan products: ${res.deletedCount}`);
    const remaining = await P.countDocuments({});
    console.log(`Products remaining in DB: ${remaining}`);

    process.exit(0);
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  }
}

run();
