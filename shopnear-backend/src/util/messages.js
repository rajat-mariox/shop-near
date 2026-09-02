module.exports = (lang = "en") => {
  const user_already_found = {
    en: "User already found with given username, Try again after new username!",
  };

  const success = {
    en: "success",
  };

  const logout = {
    en: "logout successfully",
  };

  const invalid_token = {
    en: "invalid token",
  };

  const users_list = {
    en: "users list",
  };

  const interest_exists = {
    en: "you have added this interest before",
  };

  const user_not_found = {
    en: "user detail not found with given id",
  };

  const forbidden = {
    en: "forbidden",
  };

  const otp_sent = {
    en: "otp send to your register mobile number",
  };

  const otp_verified = {
    en: "login successfully",
  };

  const incorrect_otp = {
    en: "incorrect otp, try again!",
  };

  const status_changed = {
    en: "status changed successfully",
  };

  const category_added = {
    en: "category added successfully",
  };

  const category_updated = {
    en: "category updated successfully",
  };

  const category_deleted = {
    en: "category deleted successfully",
  };

  const category_not_found = {
    en: "category not found",
  };

  const category_list = {
    en: "category list",
  };

  const sellers_list = {
    en: "sellers list",
  };

  const seller_created = {
    en: "seller created successfully",
  };

  const seller_approved = {
    en: "seller approved successfully",
  };

  const seller_rejected = {
    en: "seller rejected",
  };

  const seller_not_found = {
    en: "seller not found",
  };

  const seller_already_exists = {
    en: "seller already exists with this mobile number",
  };

  const mobile_required = {
    en: "mobile number is required",
  };

  const invalid_or_expired_otp = {
    en: "invalid or expired otp",
  };

  const seller_not_approved = {
    en: "seller not approved yet",
  };

  const otp_sent_on_mail = {
    en: "otp sent on your registered email",
  };

  const otp_email_failed = {
    en: "failed to send otp email, try again later",
  };

  const admin_not_found = {
    en: "admin not found with given email",
  };

  return {
    user_already_found: user_already_found[lang],
    success: success[lang],
    logout: logout[lang],
    invalid_token: invalid_token[lang],
    users_list: users_list[lang],
    user_not_found: user_not_found[lang],
    forbidden: forbidden[lang],
    otp_sent: otp_sent[lang],
    otp_verified: otp_verified[lang],
    incorrect_otp: incorrect_otp[lang],
    status_changed: status_changed[lang],
    interest_exists: interest_exists[lang],
    category_added: category_added[lang],
    category_updated: category_updated[lang],
    category_deleted: category_deleted[lang],
    category_not_found: category_not_found[lang],
    category_list: category_list[lang],
    sellers_list: sellers_list[lang],
    seller_created: seller_created[lang],
    seller_approved: seller_approved[lang],
    seller_rejected: seller_rejected[lang],
    seller_not_found: seller_not_found[lang],
    seller_already_exists: seller_already_exists[lang],
    mobile_required: mobile_required[lang],
    invalid_or_expired_otp: invalid_or_expired_otp[lang],
    seller_not_approved: seller_not_approved[lang],
    otp_sent_on_mail: otp_sent_on_mail[lang],
    otp_email_failed: otp_email_failed[lang],
    admin_not_found: admin_not_found[lang],
  };
};
