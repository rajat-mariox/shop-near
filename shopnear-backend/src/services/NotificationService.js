const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/User");

// Firebase Admin ek hi baar init hota hai; service account file repo me
// gitignored hai, prod par FIREBASE_SERVICE_ACCOUNT env se path override kar sakte hain
let initialized = false;

const initFirebase = () => {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return true;
  }

  try {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      path.join(__dirname, "../../firebase-service-account.json");

    const serviceAccount = require(serviceAccountPath);

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
          sound: "default",
          channelId: "default",
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
        orderId: orderId,
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
