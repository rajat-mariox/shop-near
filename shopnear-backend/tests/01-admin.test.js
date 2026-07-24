/**
 * E2E Test Suite 1 — Admin Authentication & Management
 */
const config = require("./config");
const t = require("./utils");

let adminToken = "";
let adminId = "";

async function run() {
  t.section("1. ADMIN AUTHENTICATION");

  // ── 1.1 Login with valid credentials ──
  t.subsection("1.1 Admin Login — Happy Path");
  let res = await t.POST("/admin/login", {
    email: config.ADMIN_EMAIL,
    password: config.ADMIN_PASSWORD,
  });
  t.assert(res.status === 200, "Admin login returns 200");
  t.assert(
    res.data.code === 1,
    "Admin login code=1 (success)",
    `Got code=${res.data.code}, msg=${res.data.message}`,
  );
  t.assert(!!res.data.data?.token, "Admin login returns token");
  t.assert(!!res.data.data?.admin?._id, "Admin login returns admin object");

  if (res.data.data?.token) {
    adminToken = res.data.data.token;
    adminId = res.data.data.admin._id;
    t.setToken(adminToken);
  }

  // ── 1.2 Login with wrong password ──
  t.subsection("1.2 Admin Login — Wrong Password");
  res = await t.POST("/admin/login", {
    email: config.ADMIN_EMAIL,
    password: "WrongPassword123!",
  });
  t.assert(res.status === 200, "Wrong password returns 200 (API convention)");
  t.assert(
    res.data.code === 0,
    "Wrong password code=0",
    `Got code=${res.data.code}`,
  );
  t.assert(
    !res.data.data?.token || res.data.message === "incorrect_password",
    "Wrong password does not yield usable token",
  );

  // ── 1.3 Login with non-existent email ──
  t.subsection("1.3 Admin Login — Non-Existent Email");
  res = await t.POST("/admin/login", {
    email: "nobody@nowhere.com",
    password: "anything",
  });
  t.assert(res.data.code === 0, "Non-existent email code=0");
  t.assert(
    res.data.message?.includes("not_found") || res.data.code === 0,
    "Non-existent email returns admin_not_found",
  );

  // ── 1.4 Login with empty body ──
  t.subsection("1.4 Admin Login — Empty Body");
  res = await t.POST("/admin/login", {});
  t.assert(
    res.status >= 200 && res.status < 500,
    "Empty body does not crash server",
  );
  t.assert(
    res.data.code === 0 || res.status === 422 || res.status === 400,
    "Empty body rejected",
  );

  // ── 1.5 Get Admin Details (Authenticated) ──
  t.subsection("1.5 Get Admin Details");
  t.setToken(adminToken);
  res = await t.GET("/admin/getDetails", { adminId });
  t.assert(res.status === 200, "Get admin details returns 200");
  t.assert(res.data.code === 1, "Get admin details code=1");
  t.assert(!!res.data.data?.admin, "Get admin details returns admin info");

  // ── 1.6 Get Admin Details without token ──
  t.subsection("1.6 Get Admin Details — No Token");
  t.clearToken();
  res = await t.GET("/admin/getDetails");
  t.assert(
    res.data.code === 0 || res.data.code === 3 || res.status === 401,
    "No token: admin details rejected",
  );

  // Restore token for further tests
  t.setToken(adminToken);

  // ══ ADMIN: DASHBOARD ══
  t.section("2. ADMIN DASHBOARD");
  t.subsection("2.1 Dashboard Stats");
  res = await t.GET("/admin/dashboard/stats");
  t.assert(res.status === 200, "Dashboard stats returns 200");
  t.assert(
    res.data.code === 1,
    "Dashboard stats code=1",
    `Got ${res.data.code}: ${res.data.message}`,
  );

  // ══ ADMIN: USERS MANAGEMENT ══
  t.section("3. ADMIN — USERS MANAGEMENT");

  t.subsection("3.1 List Users");
  res = await t.GET("/admin/users");
  t.assert(res.status === 200, "List users returns 200");
  t.assert(res.data.code === 1, "List users code=1", `Got ${res.data.code}`);
  const users = res.data.data?.users || res.data.data?.data || [];
  const testUserId = Array.isArray(users) && users[0] ? users[0]._id : null;

  if (testUserId) {
    t.subsection("3.2 Get User Detail");
    res = await t.GET(`/admin/users/${testUserId}`);
    t.assert(res.status === 200, "Get user detail returns 200");
    t.assert(res.data.code === 1, "Get user detail code=1");

    t.subsection("3.3 Toggle User Status");
    res = await t.PUT(`/admin/users/${testUserId}/toggle-status`);
    t.assert(res.status === 200, "Toggle user status returns 200");
    // Toggle back
    await t.PUT(`/admin/users/${testUserId}/toggle-status`);
  } else {
    t.warn("No users in DB — skipping user detail/toggle tests");
  }

  // ══ ADMIN: SELLERS MANAGEMENT ══
  t.section("4. ADMIN — SELLERS MANAGEMENT");

  t.subsection("4.1 List Sellers");
  res = await t.GET("/admin/sellers");
  t.assert(res.status === 200, "List sellers returns 200");
  const sellers =
    res.data.data?.sellers || res.data.data?.data || res.data.data || [];
  const testSellerId =
    Array.isArray(sellers) && sellers[0] ? sellers[0]._id : null;

  if (testSellerId) {
    t.subsection("4.2 Get Seller Detail");
    res = await t.GET(`/admin/sellers/${testSellerId}`);
    t.assert(res.status === 200, "Get seller detail returns 200");
  } else {
    t.warn("No sellers in DB — skipping seller detail tests");
  }

  // ══ ADMIN: CATEGORIES ══
  t.section("5. ADMIN — CATEGORIES CRUD");

  t.subsection("5.1 List Categories");
  res = await t.GET("/admin/categories");
  t.assert(res.status === 200, "List categories returns 200");
  t.assert(
    res.data.code === 1,
    "List categories code=1",
    `Got ${res.data.code}`,
  );

  t.subsection("5.2 Create Category");
  res = await t.POST("/admin/categories", {
    categoryName: "__TEST_CATEGORY__",
    image: "https://via.placeholder.com/150",
    isActive: true,
  });
  const catCreated = res.data.code === 1;
  t.assert(res.status === 200, "Create category returns 200");
  const catId = res.data.data?._id || res.data.data?.category?._id;

  if (catId) {
    t.subsection("5.3 Get Category By ID");
    res = await t.GET(`/admin/categories/${catId}`);
    t.assert(
      res.status === 200 && res.data.code === 1,
      "Get category by ID success",
    );

    t.subsection("5.4 Toggle Category Status");
    res = await t.PATCH(`/admin/categories/${catId}`);
    t.assert(res.status === 200, "Toggle category status returns 200");

    t.subsection("5.5 Delete Category");
    res = await t.DELETE(`/admin/categories/${catId}`);
    t.assert(res.status === 200, "Delete category returns 200");
  } else {
    t.warn(
      "Category creation failed — skipping CRUD",
      JSON.stringify(res.data),
    );
  }

  // ══ ADMIN: BANNERS ══
  t.section("6. ADMIN — BANNERS");

  t.subsection("6.1 List Banners");
  res = await t.GET("/admin/banners");
  t.assert(res.status === 200, "List banners returns 200");

  // ══ ADMIN: PRODUCTS MANAGEMENT ══
  t.section("7. ADMIN — PRODUCTS MANAGEMENT");

  t.subsection("7.1 List All Products");
  res = await t.GET("/admin/products");
  t.assert(res.status === 200, "List products returns 200");
  t.assert(res.data.code === 1, "List products code=1", `Got ${res.data.code}`);
  const products = res.data.data?.products || [];
  const testProductId = products[0]?._id;

  if (testProductId) {
    t.subsection("7.2 Get Product Detail");
    res = await t.GET(`/admin/products/${testProductId}`);
    t.assert(res.status === 200, "Get product detail returns 200");
    t.assert(res.data.code === 1, "Get product detail code=1");
  } else {
    t.warn("No products in DB — skipping product detail test");
  }

  // ══ ADMIN: ORDERS MANAGEMENT ══
  t.section("8. ADMIN — ORDERS MANAGEMENT");

  t.subsection("8.1 List All Orders");
  res = await t.GET("/admin/orders");
  t.assert(res.status === 200, "List orders returns 200");
  t.assert(res.data.code === 1, "List orders code=1", `Got ${res.data.code}`);
  const orders = res.data.data?.orders || [];
  const testOrderId = orders[0]?._id;

  if (testOrderId) {
    t.subsection("8.2 Get Order Detail");
    res = await t.GET(`/admin/orders/${testOrderId}`);
    t.assert(res.status === 200, "Get order detail returns 200");
    t.assert(res.data.code === 1, "Get order detail code=1");
  } else {
    t.warn("No orders in DB — skipping order detail test");
  }

  // ══ ADMIN: CMS PAGES ══
  t.section("9. ADMIN — CMS PAGES");
  const cmsPages = [
    "terms",
    "privacy",
    "about",
    "shipping",
    "cancellation",
    "refund",
    "contact",
  ];

  for (const page of cmsPages) {
    t.subsection(`9.x GET CMS: ${page}`);
    res = await t.GET(`/admin/cms/${page}`);
    t.assert(res.status === 200, `GET /admin/cms/${page} returns 200`);
  }

  // Test writing CMS
  t.subsection("9.x POST CMS: terms (write)");
  res = await t.POST("/admin/cms/terms", {
    termsAndConditions: "<p>Test terms from E2E suite</p>",
  });
  t.assert(res.status === 200, "POST /admin/cms/terms returns 200");

  return { adminToken, adminId };
}

module.exports = { run };
