"use strict";

const User = require("../models/User");
const UserAddress = require("../models/UserAddress");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");

// Play Store policy: delete request ke baad 7 din ka grace period
const GRACE_PERIOD_DAYS = 7;
const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

module.exports = () => {
  const isGracePeriodExpired = (deletionRequestedAt) => {
    if (!deletionRequestedAt) return false;
    return Date.now() - new Date(deletionRequestedAt).getTime() > GRACE_PERIOD_MS;
  };

  /**
   * Ek user ko permanently delete karta hai.
   * User doc hard-delete nahi hota — orders/ratings ke populate("userId") refs
   * na tootein isliye doc ko scrub karte hain: personal data blank, mobile number
   * "del_" prefix se rename (taaki real number naye registration ke liye free ho jaye).
   * Addresses / cart / wishlist poori tarah delete hote hain.
   * Orders business/GST records ke liye rehte hain — unme personal data
   * scrubbed user doc se hi aata hai jo ab "Deleted User" dikhayega.
   */
  const purgeUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    await Promise.all([
      UserAddress.deleteMany({ userId }),
      Cart.deleteMany({ userId }),
      Wishlist.deleteMany({ userId }),
    ]);

    // updateOne validators skip karta hai — "del_" wala number
    // mobile regex se match nahi hota isliye save() use nahi kar sakte
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          fullName: "Deleted User",
          email: "",
          profileImages: "",
          dob: "",
          mobileNumber: `del_${Date.now()}_${user.mobileNumber}`,
          isActive: false,
          isDeleted: true,
          notificationAllowed: false,
          token: null,
          deviceToken: null,
          location: { type: "Point", coordinates: [0, 0] },
        },
      }
    );

    console.log(`AccountDeletionService => purged user ${userId}`);
  };

  /**
   * Daily job: jin users ka grace period khatam ho gaya unhe purge karo
   */
  const purgeExpiredAccounts = async () => {
    const cutoff = new Date(Date.now() - GRACE_PERIOD_MS);
    const expired = await User.find({
      isDeleted: { $ne: true },
      deletionRequestedAt: { $ne: null, $lte: cutoff },
    }).select("_id");

    if (expired.length === 0) return;
    console.log(
      `AccountDeletionService => purging ${expired.length} expired account(s)`
    );

    for (const u of expired) {
      try {
        await purgeUser(u._id);
      } catch (err) {
        console.error(`AccountDeletionService => failed to purge ${u._id}`, err);
      }
    }
  };

  return {
    GRACE_PERIOD_DAYS,
    isGracePeriodExpired,
    purgeUser,
    purgeExpiredAccounts,
  };
};
