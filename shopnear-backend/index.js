const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 9110;
const app = express();
app.use(express.json());

// ✅ Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

const cors = require("cors");

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization,x-user-data",
  })
);

const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    limits: { fileSize: 100000000 },
  })
);

// Mount all routes
app.use("/v1/api", require("./src/routes"));

// Public pages (bina login) - Play Store listing ke liye:
//   https://backend.aaspass.net/privacy-policy   (Privacy policy URL)
//   https://backend.aaspass.net/delete-account   (Data safety -> Account deletion URL)
const PublicPagesController = require("./src/controllers/PublicPagesController")();
app.get("/privacy-policy", PublicPagesController.privacyPolicy);
app.get("/delete-account", PublicPagesController.deleteAccount);

// Health route
app.use("/", (req, res) => {
  res.send("Hello from main");
});

// Account deletion purge job (Play Store policy):
// 7-din grace period khatam hone wale accounts permanently delete hote hain.
// Startup ke thodi der baad + har 12 ghante mein chalta hai.
const AccountDeletionService = require("./src/services/AccountDeletionService");
const runPurgeJob = () => {
  AccountDeletionService()
    .purgeExpiredAccounts()
    .catch((err) => console.error("Account purge job failed:", err));
};
setTimeout(runPurgeJob, 30 * 1000);
setInterval(runPurgeJob, 12 * 60 * 60 * 1000);

// Unpaid online orders (Razorpay cancel/fail/app band) 15 min baad auto-cancel
// + stock wapas. Har 5 min chalta hai.
const PaymentExpiryService = require("./src/services/PaymentExpiryService");
const runPaymentExpiryJob = () => {
  PaymentExpiryService()
    .expireStaleUnpaidOrders()
    .catch((err) => console.error("Payment expiry job failed:", err));
};
setTimeout(runPaymentExpiryJob, 20 * 1000);
setInterval(runPaymentExpiryJob, 5 * 60 * 1000);

// ✅ Start the server
app.listen(PORT, () => {
  console.log("service listening on port " + PORT);
});
