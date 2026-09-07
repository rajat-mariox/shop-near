const PanelNotificationService = require("../services/PanelNotificationService");

/**
 * Seller panel (/seller/notifications) aur admin panel (/admin/notifications)
 * dono ke liye. Auth middleware req.body me sellerId ya adminId daalta hai,
 * usi se scope tay hota hai.
 */
module.exports = () => {
  const scopeOf = (req) =>
    req.body && req.body.adminId
      ? { recipientType: "admin", recipientId: null }
      : { recipientType: "seller", recipientId: req.body.sellerId };

  const list = async (req, res, next) => {
    const { page, limit } = req.query;
    req.rData = await PanelNotificationService().list({
      ...scopeOf(req),
      page,
      limit,
    });
    req.msg = "success";
    next();
  };

  const unreadCount = async (req, res, next) => {
    const unread = await PanelNotificationService().unreadCount(scopeOf(req));
    req.rData = { unread };
    req.msg = "success";
    next();
  };

  const markRead = async (req, res, next) => {
    await PanelNotificationService().markRead(scopeOf(req), req.params.id);
    req.rData = {};
    req.msg = "success";
    next();
  };

  const markAllRead = async (req, res, next) => {
    await PanelNotificationService().markAllRead(scopeOf(req));
    req.rData = {};
    req.msg = "success";
    next();
  };

  return { list, unreadCount, markRead, markAllRead };
};
