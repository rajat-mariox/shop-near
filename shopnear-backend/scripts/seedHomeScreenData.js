/**
 * Seed Script - Populate Home Screen Data
 * Run this script to create initial home screen data in database
 *
 * Usage: node scripts/seedHomeScreenData.js
 */

const mongoose = require("mongoose");
const path = require("path");

// Load models
const Banners = require("../src/models/Banners");
const Brands = require("../src/models/Brands");
const ShopCategory = require("../src/models/ShopCategory");
const PromoCode = require("../src/models/PromoCode");
const DeliverySettings = require("../src/models/DeliverySettings");

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/shopnear";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✓ Connected to MongoDB");
    seedData();
  })
  .catch((error) => {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Clear existing data
    console.log("\n📋 Clearing existing seed data...");
    await Banners.deleteMany({ title: { $regex: "Festive|Mega|Summer" } });
    await ShopCategory.deleteMany({
      name: {
        $in: [
          "Clothes Shop",
          "Grocery Shop",
          "Electronics Shop",
          "Footwear Shop",
        ],
      },
    });
    await PromoCode.deleteMany({
      code: { $in: ["DEAL20", "WOW1000", "NEWDAY", "SUMMER50"] },
    });

    // Seed Banners
    console.log("\n🎨 Creating Banners...");
    const banners = await Banners.insertMany([
      {
        title: "Festive Fashion Specials",
        subtitle: "Big Styles, Big Savings!",
        mobileView: "/images/banners/festive1.png",
        ipadView: "/images/banners/festive1_ipad.png",
        desktopView: "/images/banners/festive1_desktop.png",
        rank: 1,
        startDate: new Date("2026-01-01"),
        expireDate: new Date("2026-12-31"),
        isActive: true,
      },
      {
        title: "Mega Sale Event",
        subtitle: "50% OFF on All Brands",
        mobileView: "/images/banners/mega-sale.png",
        ipadView: "/images/banners/mega-sale_ipad.png",
        desktopView: "/images/banners/mega-sale_desktop.png",
        rank: 2,
        startDate: new Date("2026-01-01"),
        expireDate: new Date("2026-12-31"),
        isActive: true,
      },
      {
        title: "Summer Collection",
        subtitle: "Fresh Arrivals Every Week",
        mobileView: "/images/banners/summer.png",
        ipadView: "/images/banners/summer_ipad.png",
        desktopView: "/images/banners/summer_desktop.png",
        rank: 3,
        startDate: new Date("2026-01-01"),
        expireDate: new Date("2026-12-31"),
        isActive: true,
      },
    ]);
    console.log(`✓ Created ${banners.length} banners`);

    // Seed Shop Categories
    console.log("\n🏪 Creating Shop Categories...");
    const categories = await ShopCategory.insertMany([
      {
        name: "Clothes Shop",
        description: "Fashion and clothing stores",
        icon: "/icons/clothes.png",
        image: "/images/categories/clothes-shop.png",
        displayOrder: 1,
        isActive: true,
      },
      {
        name: "Grocery Shop",
        description: "Fresh groceries and daily needs",
        icon: "/icons/grocery.png",
        image: "/images/categories/grocery-shop.png",
        displayOrder: 2,
        isActive: true,
      },
      {
        name: "Electronics Shop",
        description: "Electronics and gadgets",
        icon: "/icons/electronics.png",
        image: "/images/categories/electronics-shop.png",
        displayOrder: 3,
        isActive: true,
      },
      {
        name: "Footwear Shop",
        description: "Shoes and footwear",
        icon: "/icons/footwear.png",
        image: "/images/categories/footwear-shop.png",
        displayOrder: 4,
        isActive: true,
      },
      {
        name: "Beauty & Cosmetics",
        description: "Beauty and personal care products",
        icon: "/icons/beauty.png",
        image: "/images/categories/beauty-shop.png",
        displayOrder: 5,
        isActive: true,
      },
      {
        name: "Home & Kitchen",
        description: "Home appliances and kitchen items",
        icon: "/icons/home.png",
        image: "/images/categories/home-shop.png",
        displayOrder: 6,
        isActive: true,
      },
    ]);
    console.log(`✓ Created ${categories.length} shop categories`);

    // Seed Promo Codes
    console.log("\n🎟️ Creating Promo Codes...");
    const promoCodes = await PromoCode.insertMany([
      {
        code: "DEAL20",
        title: "Get 20% Instant Discount",
        description: "20% discount on minimum order of ₹100",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 100,
        maxUsageLimit: 100,
        usageCount: 0,
        validityStartDate: new Date("2026-01-01"),
        validityEndDate: new Date("2026-03-31"),
        image: "/images/promos/deal20.png",
        displayOnHome: true,
        isActive: true,
      },
      {
        code: "WOW1000",
        title: "WIN ₹1000 Cashback",
        description: "Get ₹1000 cashback on orders above ₹2000",
        discountType: "fixed",
        discountValue: 1000,
        minOrderValue: 2000,
        maxUsageLimit: 50,
        usageCount: 0,
        validityStartDate: new Date("2026-01-01"),
        validityEndDate: new Date("2026-04-30"),
        image: "/images/promos/wow1000.png",
        displayOnHome: true,
        isActive: true,
      },
      {
        code: "NEWDAY",
        title: "Flat ₹50 OFF",
        description: "New customers - Get ₹50 discount on first order",
        discountType: "fixed",
        discountValue: 50,
        minOrderValue: 0,
        maxUsageLimit: 200,
        usageCount: 0,
        validityStartDate: new Date("2026-01-01"),
        validityEndDate: new Date("2026-06-30"),
        image: "/images/promos/newday.png",
        displayOnHome: true,
        isActive: true,
      },
      {
        code: "SUMMER50",
        title: "Summer Special - 50% OFF",
        description: "50% discount on selected summer items",
        discountType: "percentage",
        discountValue: 50,
        minOrderValue: 500,
        maxUsageLimit: 75,
        usageCount: 0,
        validityStartDate: new Date("2026-03-01"),
        validityEndDate: new Date("2026-05-31"),
        image: "/images/promos/summer50.png",
        displayOnHome: true,
        isActive: true,
      },
    ]);
    console.log(`✓ Created ${promoCodes.length} promo codes`);

    // Seed Delivery Settings
    console.log("\n🚚 Creating Delivery Settings...");
    const deliverySettings = await DeliverySettings.findOneAndUpdate(
      { isActive: true },
      {
        estimatedDeliveryTime: 20,
        deliveryCharge: 50,
        location: "Home - Sultan Bhag, Erraga",
        freeDeliveryAbove: 300,
        maxDeliveryRadius: 15,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    console.log("✓ Delivery Settings created/updated");

    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`  - Banners: ${banners.length}`);
    console.log(`  - Shop Categories: ${categories.length}`);
    console.log(`  - Promo Codes: ${promoCodes.length}`);
    console.log(`  - Delivery Settings: 1`);
    console.log("\nNote: Make sure you have:");
    console.log("  - Brands in Brands collection");
    console.log("  - Offers in Offers collection");
    console.log("  - Verified Sellers in Seller collection");
    console.log(
      "\nThe home screen will fetch all this data dynamically from the database.\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding error:", error);
    process.exit(1);
  }
};
