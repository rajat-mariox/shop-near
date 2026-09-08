const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/User");

// Firebase Admin ek hi baar init hota hai; service account file repo me
// gitignored hai, prod par FIREBASE_SERVICE_ACCOUNT env se path override kar sakte hain
let initialized = false;

/**
 * Service account env se (prod/deploy ke liye, file commit nahi karni padti):
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON  = poora JSON (raw ya base64)
 *   2. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *      (private key me newlines "\n" likhe ho sakte hain)
 *   3. fallback: FIREBASE_SERVICE_ACCOUNT (file path) ya firebase-service-account.json
 */
const loadServiceAccount = () => {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    const text = rawJson.trim().startsWith("{")
      ? rawJson
      : Buffer.from(rawJson, "base64").toString("utf8");
    return JSON.parse(text);
  }
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    path.join(__dirname, "../../firebase-service-account.json");
  return require(serviceAccountPath);
};

const initFirebase = () => {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return true;
  }

  try {
    const serviceAccount = loadServiceAccount();

    initializeApp({
      credential: cert(serviceAccount),
    });

    initialized = true;
    console.log("Firebase Admin initialized:", serviceAccount.project_id);
    return true;
  } catch (error) {
    console.error("Firebase Admin init failed:", error.message);
    return false;
  }
};

module.exports = () => {
  /**
   * Ek FCM token par notification bhejo
   */
  const sendToToken = async (deviceToken, { title, body, data = {} }) => {
    if (!initFirebase()) return null;

    const message = {
      token: deviceToken,
      notification: { title, body },
      // data values string hi honi chahiye (FCM requirement)
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: "high",
        notification: {
          // App (MainApplication.kt) is channel ko HIGH importance se banata hai:
          // heads-up + sound. Galat id par Android silent fallback channel use karta hai.
          channelId: "order_updates_v2",
          icon: "ic_notification",
          color: "#FF6051",
          // Sound: channel ke saath-saath payload me bhi explicit
          sound: "default",
          defaultSound: true,
          defaultVibrateTimings: true,
          priority: "high",
          visibility: "public",
        },
      },
    };

    return getMessaging().send(message);
  };

  /**
   * User ko notification bhejo — notificationAllowed respect karta hai,
   * invalid/expired token DB se clear kar deta hai.
   * Fire-and-forget: errors yahin log hote hain, kabhi throw nahi karta
   * taaki order flow kabhi na toote.
   */
  const sendToUser = async (userId, { title, body, data = {} }) => {
    try {
      const user = await User.findById(userId).select(
        "deviceToken notificationAllowed"
      );

      if (!user || !user.deviceToken || !user.notificationAllowed) {
        return null;
      }

      return await sendToToken(user.deviceToken, { title, body, data });
    } catch (error) {
      // Token stale ho gaya (app uninstall / token rotate) — clear kar do
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/invalid-argument"
      ) {
        await User.findByIdAndUpdate(userId, { deviceToken: "" }).catch(
          () => {}
        );
      }
      console.error(
        `Notification failed for user ${userId}:`,
        error.message
      );
      return null;
    }
  };

  /**
   * Order status change par customer ko notification
   */
  const sendOrderStatusNotification = async (order, status, extra = {}) => {
    const orderId = order.orderId || "";
    const userId = order.userId && order.userId._id ? order.userId._id : order.userId;
    if (!userId) return null;

    const messages = {
      pending: {
        title: "Order Placed 🛍️",
        body: `Your order ${orderId} has been placed successfully.`,
      },
      confirmed: {
        title: "Order Confirmed ✅",
        body: `Your order ${orderId} has been confirmed by the seller.`,
      },
      processing: {
        title: "Order Processing 📦",
        body: `Your order ${orderId} is being prepared.`,
      },
      shipped: {
        title: "Out for Delivery 🚚",
        body: `Your order ${orderId} is out for delivery.`,
      },
      delivered: {
        title: "Order Delivered 🎉",
        body: `Your order ${orderId} has been delivered. Thank you for shopping!`,
      },
      cancelled: {
        title: "Order Cancelled ❌",
        body: `Your order ${orderId} has been cancelled.`,
      },
      payment_success: {
        title: "Payment Successful 💳",
        body: `Payment received for order ${orderId}. Your order is confirmed.`,
      },
    };

    const msg = messages[status];
    if (!msg) return null;

    return sendToUser(userId, {
      title: msg.title,
      body: extra.body || msg.body,
      data: {
        type: "order",
        // App tracking screen Mongo _id se fetch karti hai; ORD- number alag field me
        orderId: String(order._id || orderId),
        orderNumber: orderId,
        status: status,
        ...(extra.data || {}),
      },
    });
  };

  /**
   * Shipped par customer ko delivery OTP push — sirf app par dikhta hai,
   * SMS nahi jata. OTP data payload me bhi jata hai taaki app tracking
   * screen turant refresh kar sake.
   */
  const sendDeliveryOtpNotification = async (order, otp) => {
    const orderId = order.orderId || "";
    return sendOrderStatusNotification(order, "shipped", {
      body: `Your order ${orderId} is out for delivery. Delivery OTP: ${otp} — share it with the delivery partner.`,
      data: { otp: String(otp) },
    });
  };

  return {
    sendToToken,
    sendToUser,
    sendOrderStatusNotification,
    sendDeliveryOtpNotification,
  };
};
