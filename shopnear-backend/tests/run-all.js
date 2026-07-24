/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ShopNear — End-to-End Dynamic Testing & VAPT Runner         ║
 * ║  Run: node tests/run-all.js                                  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */
const fs = require("fs");
const path = require("path");
const t = require("./utils");

const adminTests = require("./01-admin.test");
const customerTests = require("./02-customer.test");
const sellerTests = require("./03-seller.test");
const vaptTests = require("./04-vapt.test");

async function main() {
  const startTime = Date.now();

  console.log(
    "╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║       ShopNear — E2E + VAPT Test Suite                       ║",
  );
  console.log(
    "║       Target: http://localhost:9001/v1/api                    ║",
  );
  console.log(`║       Started: ${new Date().toISOString()}              ║`);
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝",
  );

  let adminToken, userToken, sellerToken;
  let adminId, userId, sellerId;

  try {
    // Phase 1: Admin E2E
    console.log("\n🔷 Phase 1: Admin Panel Tests");
    const adminResult = await adminTests.run();
    adminToken = adminResult?.adminToken;
    adminId = adminResult?.adminId;

    // Phase 2: Customer E2E
    console.log("\n🔷 Phase 2: Customer App Tests");
    const customerResult = await customerTests.run();
    userToken = customerResult?.userToken;
    userId = customerResult?.userId;

    // Phase 3: Seller E2E
    console.log("\n🔷 Phase 3: Seller Panel Tests");
    const sellerResult = await sellerTests.run();
    sellerToken = sellerResult?.sellerToken;
    sellerId = sellerResult?.sellerId;

    // Phase 4: VAPT
    console.log("\n🔷 Phase 4: VAPT — Vulnerability Assessment");
    await vaptTests.run({ adminToken, userToken, sellerToken });
  } catch (err) {
    console.error("\n💥 CRITICAL ERROR during tests:", err.message);
    console.error(err.stack);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱ Total execution time: ${elapsed}s`);

  // Print summary
  const summary = t.printSummary();

  // Save JSON report
  const report = t.getJSONReport();
  report.executionTime = `${elapsed}s`;
  const reportPath = path.join(__dirname, "test-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 JSON report saved to: ${reportPath}`);

  // Exit with code 1 if failures
  process.exit(summary.failed > 0 ? 1 : 0);
}

main();
