/**
 * Test Utilities - HTTP client, reporters, helpers
 */
const axios = require("axios");
const config = require("./config");

// ─── Counters ───
let passed = 0;
let failed = 0;
let warnings = 0;
const results = [];

// ─── HTTP Client ───
const client = axios.create({
  baseURL: config.BASE_URL,
  timeout: config.REQUEST_TIMEOUT,
  validateStatus: () => true, // never throw on HTTP status
  headers: { "Content-Type": "application/json" },
});

function setToken(token, type = "Bearer") {
  client.defaults.headers.common["Authorization"] = `${type} ${token}`;
}

function clearToken() {
  delete client.defaults.headers.common["Authorization"];
}

// ─── Request helpers ───
async function GET(path, params = {}) {
  return client.get(path, { params });
}

async function POST(path, data = {}) {
  return client.post(path, data);
}

async function PUT(path, data = {}) {
  return client.put(path, data);
}

async function PATCH(path, data = {}) {
  return client.patch(path, data);
}

async function DELETE(path, data = {}) {
  return client.delete(path, { data });
}

// ─── Assertions ───
function assert(condition, testName, details = "") {
  if (condition) {
    results.push({ status: "PASS", testName, details });
    passed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    results.push({ status: "FAIL", testName, details });
    failed++;
    console.log(`  ❌ FAIL: ${testName}${details ? " — " + details : ""}`);
  }
  return condition;
}

function warn(testName, details = "") {
  results.push({ status: "WARN", testName, details });
  warnings++;
  console.log(`  ⚠️  WARN: ${testName}${details ? " — " + details : ""}`);
}

function section(name) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${"═".repeat(60)}`);
}

function subsection(name) {
  console.log(`\n  ── ${name} ──`);
}

// ─── Summary Report ───
function printSummary() {
  console.log(`\n${"═".repeat(60)}`);
  console.log("  📊 TEST SUMMARY");
  console.log(`${"═".repeat(60)}`);
  console.log(`  Total:    ${passed + failed + warnings}`);
  console.log(`  ✅ Passed:  ${passed}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  ⚠️  Warnings: ${warnings}`);
  console.log(`${"═".repeat(60)}`);

  if (failed > 0) {
    console.log("\n  ❌ FAILED TESTS:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => console.log(`    • ${r.testName}: ${r.details}`));
  }

  if (warnings > 0) {
    console.log("\n  ⚠️  WARNING TESTS:");
    results
      .filter((r) => r.status === "WARN")
      .forEach((r) => console.log(`    • ${r.testName}: ${r.details}`));
  }

  console.log("");
  return { passed, failed, warnings, results };
}

// ─── JSON report ───
function getJSONReport() {
  return {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, warnings, total: passed + failed + warnings },
    results,
  };
}

module.exports = {
  client,
  setToken,
  clearToken,
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  assert,
  warn,
  section,
  subsection,
  printSummary,
  getJSONReport,
};
