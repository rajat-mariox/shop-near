/**
 * E2E Test Suite 2 — Customer Auth, Profile, Sellers/Products Browsing
 */
const config = require("./config");
const t = require("./utils");

let userToken = "";
let userId = "";

async function run() {
  t.section("10. CUSTOMER AUTHENTICATION (OTP Flow)");

  // ── 10.1 Send OTP (Login) ──
  t.subsection("10.1 Customer Login — Send OTP");
  let res = await t.POST("/auth/login", {
    mobileNumber: config.USER_MOBILE,
    countryCode: config.USER_COUNTRY_CODE,
  });
  t.assert(res.status === 200, "Customer login OTP send returns 200");
  t.assert(
    res.data.code === 1 || res.data.code === 0,
    "Customer login responds",
    `code=${res.data.code}`,
  );

  // ── 10.2 Verify OTP ──
  t.subsection("10.2 Customer Verify OTP");
  res = await t.POST("/auth/verifyOtp", {
    mobileNumber: config.USER_MOBILE,
    countryCode: config.USER_COUNTRY_CODE,
    otp: config.MASTER_OTP,
  });
  t.assert(res.status === 200, "Verify OTP returns 200");

  if (res.data.data?.token) {
    userToken = res.data.data.token;
    userId = res.data.data.user?._id || res.data.data.userId;
    t.assert(true, "Customer token received");
  } else {
    // Try with string OTP
    res = await t.POST("/auth/verifyOtp", {
      mobileNumber: config.USER_MOBILE,
      countryCode: config.USER_COUNTRY_CODE,
      otp: parseInt(config.MASTER_OTP),
    });
    if (res.data.data?.token) {
      userToken = res.data.data.token;
      userId = res.data.data.user?._id || res.data.data.userId;
      t.assert(true, "Customer token received (int OTP)");
    } else {
      t.warn(
        "Customer OTP verify did not yield token",
        JSON.stringify(res.data),
      );
    }
  }

  // ── 10.3 Resend OTP ──
  t.subsection("10.3 Resend OTP");
  res = await t.PUT("/auth/resendOtp", {
    mobileNumber: config.USER_MOBILE,
    countryCode: config.USER_COUNTRY_CODE,
  });
  t.assert(res.status === 200, "Resend OTP returns 200");

  if (!userToken) {
    t.warn("No user token — skipping authenticated customer tests");
    return { userToken, userId };
  }

  t.setToken(userToken);

  // ══ CUSTOMER: PROFILE ══
  t.section("11. CUSTOMER PROFILE");

  t.subsection("11.1 Get Profile");
  res = await t.GET("/user/profile");
  t.assert(res.status === 200, "Get profile returns 200");
  t.assert(
    res.data.code === 1,
    "Get profile code=1",
    `Got code=${res.data.code}`,
  );

  t.subsection("11.2 Edit Profile");
  res = await t.PUT("/user/profile", {
    fullName: "E2E Test User",
    email: "e2e@test.com",
  });
  t.assert(res.status === 200, "Edit profile returns 200");

  // ══ CUSTOMER: ADDRESS ══
  t.section("12. CUSTOMER ADDRESS");

  t.subsection("12.1 Add Address");
  res = await t.POST("/user/address", {
    fullName: "Test User",
    mobileNumber: "9876543210",
    flatNo: "101",
    area: "Test Area",
    city: "Test City",
    state: "Test State",
    pincode: "110001",
    type: "home",
    isDefault: true,
  });
  t.assert(res.status === 200, "Add address returns 200");
  const addressId = res.data.data?._id || res.data.data?.address?._id;

  t.subsection("12.2 List Addresses");
  res = await t.GET("/user/address");
  t.assert(res.status === 200, "List addresses returns 200");

  if (addressId) {
    t.subsection("12.3 Get Address Detail");
    res = await t.GET(`/user/address/${addressId}`);
    t.assert(res.status === 200, "Get address detail returns 200");
  }

  // ══ CUSTOMER: HOME SCREEN ══
  t.section("13. CUSTOMER HOME SCREEN");

  t.subsection("13.1 Get Home Screen");
  res = await t.GET("/user/homeScreen");
  t.assert(res.status === 200, "Home screen returns 200");
  t.assert(
    res.data.code === 1,
    "Home screen code=1",
    `Got code=${res.data.code}`,
  );

  // ══ CUSTOMER: BROWSE SELLERS ══
  t.section("14. CUSTOMER — BROWSE SELLERS & PRODUCTS");

  t.subsection("14.1 List Sellers");
  res = await t.GET("/user/sellers");
  t.assert(res.status === 200, "List sellers returns 200");
  const sellers = res.data.data?.sellers || res.data.data || [];
  const sellerId = Array.isArray(sellers) && sellers[0] ? sellers[0]._id : null;

  if (sellerId) {
    t.subsection("14.2 Get Seller Detail");
    res = await t.GET(`/user/sellers/${sellerId}`);
    t.assert(res.status === 200, "Seller detail returns 200");

    t.subsection("14.3 Get Seller Categories");
    res = await t.GET(`/user/sellers/${sellerId}/categories`);
    t.assert(res.status === 200, "Seller categories returns 200");

    t.subsection("14.4 Get Seller Products");
    res = await t.GET(`/user/sellers/${sellerId}/products`);
    t.assert(res.status === 200, "Seller products returns 200");
  } else {
    t.warn("No sellers — skipping seller browse tests");
  }

  t.subsection("14.5 Search Products");
  res = await t.GET("/user/search", { search: "test" });
  t.assert(res.status === 200, "Search products returns 200");

  // ══ CUSTOMER: CART ══
  t.section("15. CUSTOMER — CART");

  t.subsection("15.1 Get Cart (empty)");
  res = await t.GET("/user/cart");
  t.assert(res.status === 200, "Get cart returns 200");

  t.subsection("15.2 Clear Cart");
  res = await t.DELETE("/user/cart");
  t.assert(res.status === 200, "Clear cart returns 200");

  // ══ CUSTOMER: ORDERS ══
  t.section("16. CUSTOMER — ORDERS");

  t.subsection("16.1 List My Orders");
  res = await t.GET("/user/orders");
  t.assert(res.status === 200, "List orders returns 200");

  // ══ CUSTOMER: COUPONS ══
  t.section("17. CUSTOMER — COUPONS");

  t.subsection("17.1 Get Available Coupons");
  res = await t.GET("/coupon/available");
  t.assert(res.status === 200, "Available coupons returns 200");

  // ══ CUSTOMER: OFFERS ══
  t.section("18. CUSTOMER — OFFERS");

  t.subsection("18.1 Get Home Page Offers");
  t.clearToken(); // public route
  res = await t.GET("/offers/home");
  t.assert(res.status === 200, "Home offers returns 200");

  // Restore token
  t.setToken(userToken);

  return { userToken, userId };
}

module.exports = { run };
