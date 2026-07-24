/**
 * Test Configuration
 */
module.exports = {
  BASE_URL: process.env.TEST_BASE_URL || "http://localhost:9001/v1/api",

  // Master OTP from .env for login flows
  MASTER_OTP: "115577",

  // Admin credentials (from seeder)
  ADMIN_EMAIL: "admin@shopnear.com",
  ADMIN_PASSWORD: "Admin@2025",

  // Test seller credentials (will be created during tests)
  SELLER_MOBILE: "9999888877",
  SELLER_COUNTRY_CODE: "+91",

  // Test user credentials (will be created during tests)
  USER_MOBILE: "8888777766",
  USER_COUNTRY_CODE: "+91",

  // Timeouts
  REQUEST_TIMEOUT: 10000,

  // VAPT Payloads
  SQL_INJECTION_PAYLOADS: [
    "' OR 1=1 --",
    "'; DROP TABLE users; --",
    "1' UNION SELECT null,null,null --",
    "admin'--",
    "' OR ''='",
  ],

  XSS_PAYLOADS: [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "'\"><script>alert(document.cookie)</script>",
    "<body onload=alert('XSS')>",
  ],

  NOSQL_INJECTION_PAYLOADS: [
    { $gt: "" },
    { $ne: null },
    { $regex: ".*" },
    { $where: "1==1" },
  ],

  PATH_TRAVERSAL_PAYLOADS: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system.ini",
    "....//....//....//etc/passwd",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
  ],

  COMMAND_INJECTION_PAYLOADS: [
    "; ls -la",
    "| cat /etc/passwd",
    "$(whoami)",
    "`id`",
  ],

  LARGE_PAYLOADS: {
    LONG_STRING: "A".repeat(100000),
    MANY_FIELDS: Object.fromEntries(
      Array.from({ length: 500 }, (_, i) => [`field_${i}`, `value_${i}`]),
    ),
  },
};
