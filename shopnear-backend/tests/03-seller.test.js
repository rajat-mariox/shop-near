/**
 * E2E Test Suite 3 — Seller Auth, Profile, Products, Orders
 */
const config = require("./config");
const t = require("./utils");

let sellerToken = "";
let sellerId = "";

async function run() {
  t.section("20. SELLER AUTHENTICATION (OTP Flow)");

  // ── 20.1 Send OTP (Login) ──
  t.subsection("20.1 Seller Login — Send OTP");
  let res = await t.POST("/seller/login", {
    mobile: config.SELLER_MOBILE,
    countryCode: config.SELLER_COUNTRY_CODE,
  });
  t.assert(res.status === 200, "Seller login OTP send returns 200");

  // ── 20.2 Verify OTP ──
  t.subsection("20.2 Seller Verify OTP");
  res = await t.POST("/seller/verify-otp", {
    mobile: config.SELLER_MOBILE,
    countryCode: config.SELLER_COUNTRY_CODE,
    otp: config.MASTER_OTP,
  });
  t.assert(res.status === 200, "Seller verify OTP returns 200");

  if (res.data.data?.token) {
    sellerToken = res.data.data.token;
    sellerId = res.data.data.seller?._id || res.data.data.sellerId;
    t.assert(true, "Seller token received");
  } else {
    // Try numeric OTP
    res = await t.POST("/seller/verify-otp", {
      mobile: config.SELLER_MOBILE,
      countryCode: config.SELLER_COUNTRY_CODE,
      otp: parseInt(config.MASTER_OTP),
    });
    if (res.data.data?.token) {
      sellerToken = res.data.data.token;
      sellerId = res.data.data.seller?._id || res.data.data.sellerId;
      t.assert(true, "Seller token received (int OTP)");
    } else {
      t.warn("Seller OTP verify did not yield token", JSON.stringify(res.data));
    }
  }

  if (!sellerToken) {
    t.warn("No seller token — skipping authenticated seller tests");
    return { sellerToken, sellerId };
  }

  t.setToken(sellerToken);

  // ══ SELLER: PROFILE ══
  t.section("21. SELLER PROFILE");

  t.subsection("21.1 Get Profile");
  res = await t.GET("/seller/profile");
  t.assert(res.status === 200, "Get seller profile returns 200");
  t.assert(
    res.data.code === 1,
    "Get seller profile code=1",
    `code=${res.data.code}`,
  );

  t.subsection("21.2 Edit Profile");
  res = await t.PUT("/seller/profile", {
    shopName: "E2E Test Shop",
    fullName: "E2E Seller",
  });
  t.assert(res.status === 200, "Edit seller profile returns 200");

  // ══ SELLER: CATEGORIES ══
  t.section("22. SELLER — CATEGORIES");

  t.subsection("22.1 List Categories");
  res = await t.GET("/seller/categories");
  t.assert(res.status === 200, "Seller list categories returns 200");
  const categories = res.data.data?.categories || res.data.data || [];
  const catId =
    Array.isArray(categories) && categories[0] ? categories[0]._id : null;

  // ══ SELLER: PRODUCTS ══
  t.section("23. SELLER — PRODUCTS CRUD");

  t.subsection("23.1 List Products");
  res = await t.GET("/seller/products");
  t.assert(res.status === 200, "Seller list products returns 200");
  t.assert(
    res.data.code === 1,
    "Seller list products code=1",
    `code=${res.data.code}`,
  );
  const products = res.data.data?.products || res.data.data || [];

  t.subsection("23.2 Create Product");
  res = await t.POST("/seller/products", {
    productName: "__E2E_TEST_PRODUCT__",
    description: "Created by E2E test suite",
    price: 999,
    mrp: 1299,
    stock: 50,
    categoryId: catId || "000000000000000000000000",
    unit: "piece",
    images: ["https://via.placeholder.com/300"],
  });
  t.assert(res.status === 200, "Create product returns 200");
  const newProductId = res.data.data?._id || res.data.data?.product?._id;

  if (newProductId) {
    t.subsection("23.3 Get Product Detail");
    res = await t.GET(`/seller/products/${newProductId}`);
    t.assert(res.status === 200, "Get product detail returns 200");

    t.subsection("23.4 Edit Product");
    res = await t.PUT(`/seller/products/${newProductId}`, {
      productName: "__E2E_TEST_PRODUCT_UPDATED__",
      price: 899,
    });
    t.assert(res.status === 200, "Edit product returns 200");

    t.subsection("23.5 Delete Product");
    res = await t.DELETE(`/seller/products/${newProductId}`);
    t.assert(res.status === 200, "Delete product returns 200");
  } else {
    t.warn("Product creation failed — skipping CRUD", JSON.stringify(res.data));
  }

  // ══ SELLER: ORDERS ══
  t.section("24. SELLER — ORDERS");

  t.subsection("24.1 Get Seller Orders");
  res = await t.GET("/order/seller/orders");
  t.assert(res.status === 200, "Get seller orders returns 200");

  t.subsection("24.2 Get Seller Order Stats");
  res = await t.GET("/order/seller/stats");
  t.assert(res.status === 200, "Get seller order stats returns 200");

  // ══ SELLER: COUPONS ══
  t.section("25. SELLER — COUPONS");

  t.subsection("25.1 Get Seller Coupons");
  res = await t.GET("/coupon/seller/coupons");
  t.assert(res.status === 200, "Get seller coupons returns 200");

  return { sellerToken, sellerId };
}

module.exports = { run };
