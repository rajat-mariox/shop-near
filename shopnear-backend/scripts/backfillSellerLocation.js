/**
 * Purane sellers ke lat/lng se GeoJSON `location` bharo + 2dsphere index banao.
 * Ek baar chalao (deploy ke baad):  node scripts/backfillSellerLocation.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Seller = require("../src/models/Seller");
const { isValidCoords, toPoint } = require("../src/util/geo");

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

  const sellers = await Seller.find({}).select("shopName lat lng location");
  let updated = 0;
  const missing = [];
  for (const s of sellers) {
    if (isValidCoords(s.lat, s.lng)) {
      await Seller.updateOne(
        { _id: s._id },
        { $set: { location: toPoint(s.lat, s.lng) } }
      );
      updated++;
    } else {
      // Galat/khali coords - location field hata do, warna 2dsphere index error dega
      await Seller.updateOne({ _id: s._id }, { $unset: { location: "" } });
      missing.push(`${s.shopName || "(no name)"} [${s._id}]`);
    }
  }

  await Seller.syncIndexes();

  console.log(`Total sellers: ${sellers.length}`);
  console.log(`Location set:  ${updated}`);
  console.log(`No coords:     ${missing.length}`);
  missing.forEach((m) => console.log("  - " + m));
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
