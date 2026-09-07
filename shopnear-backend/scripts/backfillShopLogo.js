/**
 * Panel ka "Change Pictures" pehle ownerImage me save hota tha, app shopLogo padhta hai.
 * Jin sellers ka ownerImage set hai (shopLogo se alag), unka shopLogo = ownerImage kar do.
 * Ek baar chalao (deploy ke baad):  node scripts/backfillShopLogo.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Seller = require("../src/models/Seller");

(async () => {
  const uri =
    process.env.LOCAL_MONGO_DB ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URI;
  if (!uri) {
    console.error("Mongo URI env (LOCAL_MONGO_DB) nahi mila");
    process.exit(1);
  }
  await mongoose.connect(uri);

  const sellers = await Seller.find({
    ownerImage: { $exists: true, $nin: ["", null] },
  }).select("shopName ownerImage shopLogo");

  let updated = 0;
  for (const s of sellers) {
    if (s.shopLogo === s.ownerImage) continue;
    await Seller.updateOne({ _id: s._id }, { $set: { shopLogo: s.ownerImage } });
    console.log(`Updated: ${s.shopName || "(no name)"} [${s._id}]`);
    updated++;
  }

  console.log(`Sellers with ownerImage: ${sellers.length}`);
  console.log(`shopLogo updated: ${updated}`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
