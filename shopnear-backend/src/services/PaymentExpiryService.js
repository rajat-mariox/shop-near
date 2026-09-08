const UserOrders = require("../models/UserOrders");
const Product = require("../models/Product");

/**
 * Online order payment se PEHLE create hota hai (Razorpay order id ke liye
 * DB order chahiye). Jab tak payment verify nahi hoti, wo "pending" unpaid
 * order hai — asli order nahi. Pehle ye user/seller/admin teeno lists me
 * normal placed order ki tarah dikhta tha (Razorpay cancel karne par bhi),
 * aur seller ko manually cancel karna padta tha.
 *
 * Fix:
 *  - HIDE_UNPAID_ONLINE: saari order lists is filter se unpaid online orders
 *    chhupa deti hain
 *  - expireStaleUnpaidOrders: 15 min purane unpaid online orders auto-cancel
 *    (stock wapas), taaki app cancel call fail/skip ho jaaye tab bhi DB saaf rahe
 */

// Unpaid online order: payment pending + order abhi pending
const UNPAID_ONLINE_FILTER = {
  paymentMode: "online",
  paymentStatus: "pending",
  status: "pending",
};

// Lists me lagane wala exclusion (Mongo query me spread karo)
const HIDE_UNPAID_ONLINE = { $nor: [UNPAID_ONLINE_FILTER] };

// Itni der tak payment complete na ho to order expire
const UNPAID_ORDER_TTL_MINUTES = 15;

module.exports = () => {
  const expireStaleUnpaidOrders = async (ttlMinutes = UNPAID_ORDER_TTL_MINUTES) => {
    const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);
    const stale = await UserOrders.find({
      ...UNPAID_ONLINE_FILTER,
      createdAt: { $lt: cutoff },
    }).select("_id orderId products");

    let expired = 0;
    for (const order of stale) {
      try {
        // Atomic guard: beech me payment verify ho gayi ho to skip
        const updated = await UserOrders.findOneAndUpdate(
          { _id: order._id, ...UNPAID_ONLINE_FILTER },
          {
            $set: {
              status: "cancelled",
              paymentStatus: "failed",
              cancelledAt: new Date(),
              cancelReason: "Payment not completed",
              "sellerOrderStatus.$[].status": "cancelled",
              "sellerOrderStatus.$[].updatedAt": new Date(),
            },
          },
          { new: true }
        );
        if (!updated) continue;
        // Order create par reserve hua stock wapas
        for (const item of order.products || []) {
          if (!item.productId || !item.quantity) continue;
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } }
          ).catch(() => {});
        }
        expired += 1;
      } catch (err) {
        console.error(`PaymentExpiry: order ${order.orderId} expire failed:`, err.message);
      }
    }
    if (expired) console.log(`PaymentExpiry: ${expired} unpaid online order(s) expired`);
    return expired;
  };

  return {
    UNPAID_ONLINE_FILTER,
    HIDE_UNPAID_ONLINE,
    UNPAID_ORDER_TTL_MINUTES,
    expireStaleUnpaidOrders,
  };
};
