/**
 * Migration: copy all collections from Atlas (remote) to local MongoDB.
 *
 * Usage: node scripts/migrateAtlasToLocal.js
 *
 * WARNING: clears each destination collection before copying.
 */
const dns = require("dns");
// Some local DNS resolvers block SRV lookups needed for mongodb+srv://
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const { MongoClient } = require("mongodb");

const SRC_URI =
  "mongodb+srv://tinkuk:AespoPMIjRTT8t9S@dev.zmhujns.mongodb.net/shop-near?appName=Dev";
const DEST_URI = "mongodb://127.0.0.1:27017/shop-near";

async function main() {
  const src = new MongoClient(SRC_URI);
  const dest = new MongoClient(DEST_URI);
  await src.connect();
  console.log("Connected to Atlas (source)");
  await dest.connect();
  console.log("Connected to local MongoDB (destination)");

  const srcDb = src.db("shop-near");
  const destDb = dest.db("shop-near");

  const collections = await srcDb.listCollections().toArray();
  console.log(`Found ${collections.length} collections`);

  for (const { name, type } of collections) {
    if (type === "view" || name.startsWith("system.")) {
      console.log(`Skipping ${name} (${type})`);
      continue;
    }
    const docs = await srcDb.collection(name).find({}).toArray();
    if (docs.length === 0) {
      console.log(`${name}: 0 docs, skipped`);
      continue;
    }
    await destDb.collection(name).deleteMany({});
    await destDb.collection(name).insertMany(docs, { ordered: false });
    console.log(`${name}: copied ${docs.length} docs`);
  }

  await src.close();
  await dest.close();
  console.log("\nDONE — all data copied to local MongoDB");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
