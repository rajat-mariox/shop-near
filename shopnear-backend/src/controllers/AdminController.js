"use strict";

const BannersService = require("../services/BannersService");
const BrandsService = require("../services/BrandsService");
const AdminService = require("../services/AdminService");
const UserService = require("../services/UserService");
const ProductService = require("../services/ProductService");
const OrderService = require("../services/OrderService");
const SettingsService = require("../services/SettingsService");
const fileUploadService = require("../util/s3");
const RegexEscape = require("regex-escape");
const helpers = require("../util/helpers");
const User = require("../models/User");
const Products = require("../models/Product");
const UserOrders = require("../models/UserOrders");
const Seller = require("../models/Seller");
const Category = require("../models/Catagory");
const DeliverySettings = require("../models/DeliverySettings");

module.exports = () => {
  const login = async (req, res, next) => {
    console.log("AdminController => login");
    let { email, password } = req.body;
    email = email.toLowerCase();
    let query = { email };
    let admin = await AdminService().fetchByQuery(query);
    let token = "";
    if (admin) {
      let token = await helpers().createJWT({
        adminId: admin._id,
        isAdmin: true,
      });

      let passwordVerify = await AdminService().verifyPassword(
        admin._id,
        password,
      );

      if (!passwordVerify) {
        token = await helpers().createJWT({
          adminId: admin._id,
          isAdmin: true,
        });
        await AdminService().updateProfile(admin._id, { token });
        req.rCode = 0;
        req.msg = "incorrect_password";
        req.rData = {};
      } else {
        let lastLogin = new Date();
        await AdminService().updateProfile(admin._id, { lastLogin });

        if (!token) {
          token = await helpers().createJWT({
            adminId: admin._id,
            isAdmin: true,
          });
          await AdminService().updateProfile(admin._id, { token });
        }

        admin = await AdminService().fetchByQuery(query);

        req.rData = { admin, token };
      }
    } else {
      req.rCode = 0;
      req.msg = "admin_not_found";
      req.rData = {};
    }

    next();
  };

  const register = async (req, res, next) => {
    console.log("AdminController => register");
    let { email, password, name, mobile, countryCode } = req.body;

    email = email.toLowerCase();
    let query = { email };
    let token = "";
    let admin = await AdminService().fetchByQuery(query);
    if (admin) {
      req.rCode = 0;
      req.msg = "admin_already_found";
      req.rData = { token };
    } else {
      password = await helpers().hashPassword(password);
      // let adminType = "super";

      admin = { email, password, name };

      let result = await AdminService().registerAdmin(admin);

      admin = await AdminService().fetchByQuery(query);

      // token = await helpers().createJWT({ adminId: admin._id, isAdmin: true });
      await AdminService().updateProfile(admin._id, {});

      admin = await AdminService().fetchByQuery(query);

      req.rData = { admin };
    }

    next();
  };

  const addAdmin = async (req, res, next) => {
    console.log("AdminController => register");
    let {
      email,
      password,
      firstName,
      lastName,
      mobile,
      // countryCode,
      image,
      modules,
      designation,
    } = req.body;

    email = email.toLowerCase();

    modules = JSON.parse(modules);

    let query = { email };
    let token = "";
    let admin = await AdminService().fetchByQuery(query);
    // console.log(admin);
    if (admin) {
      req.rCode = 0;
      req.msg = "admin_already_found";
      req.rData = { token };
    } else {
      password = await helpers().hashPassword(password);
      let adminType = "subAdmin";

      admin = {
        email,
        password,
        firstName,
        lastName,
        mobile,
        // countryCode,
        adminType,
        modules,
        designation,
        image,
      };

      let result = await AdminService().registerAdmin(admin);

      admin = await AdminService().fetchByQuery(query);

      token = await helpers().createJWT({ adminId: admin._id, isAdmin: true });
      await AdminService().updateProfile(admin._id, { token });

      admin = await AdminService().fetchByQuery(query);

      req.rData = { admin };
    }

    next();
  };

  const editAdmin = async (req, res, next) => {
    console.log("adminController => editAdmin");
    let adminId = req.body.adminId;

    await AdminService().updateProfile(adminId, req.body);
    let Admin = await AdminService().fetch(adminId);

    req.rData = Admin;

    req.msg = "success";
    next();
  };

  const getDetails = async (req, res, next) => {
    console.log("adminController => getDetails");
    let { adminId } = req.query;
    if (!adminId) adminId = req.body.adminId;
    let admin = await AdminService().fetch(adminId);
    console.log("admin");
    console.log(admin);
    if (admin) {
      req.msg = "admin_details";
      req.rData = { admin };
    } else {
      req.rCode = 0;
      req.msg = "admin_not_found";
      req.rData = {};
    }

    next();
  };

  const forgotPassword = async (req, res, next) => {
    let { email } = req.body;

    if (email) {
      email = email.toLowerCase();
    }

    let email_query = {
      email,
    };

    let user = await AdminService().fetchByQuery(email_query);

    if (user) {
      let otp = helpers().generateOTP();

      await AdminService().updateProfile(user._id, { otp });
      user = await AdminService().fetch(user._id);

      req.msg = "otp_sent_on_mail";
      req.rData = {};
    } else {
      req.rCode = 0;
      req.msg = "admin_not_found";
      req.rData = {};
    }

    next();
  };

  const verifyOtpForForgotPassword = async (req, res, next) => {
    console.log("AdminController => verifyOtpForForgotPassword");

    let { email, otp } = req.body;

    // var verify = code == "1234" ? true : false;

    if (!email) {
      return res
        .status(400)
        .send({ code: 0, message: "email require!", data: {} });
    }

    let otpUser = 1234;
    email = email.toLowerCase();

    var query = { email };
    let user = null;
    var msg = "admin_not_found";
    let token = null;

    email = email.toLowerCase();

    var query = { email };

    user = await AdminService().fetchByQuery(query);

    if (user) {
      token = await helpers().createJWT({ adminId: user._id, isAdmin: true });

      otpUser = user.otp;
    } else {
      msg = "admin_not_found";
    }

    var verify = otp == otpUser;

    if (user) {
      if (verify) {
        req.rData = { token, user };
        req.msg = "otp_verified";
      } else {
        req.rCode = 0;
        req.msg = "incorrect_otp";
      }
    } else {
      req.rCode = 0;
      req.msg = msg;
    }
    next();
  };

  const resendOtpForEmail = async (req, res, next) => {
    console.log("AdminController => resendOtpForEmail");
    let { email } = req.body;

    if (email) {
      email = email.toLowerCase();
    }

    var query = { email };

    let user = await AdminService().fetchByQuery(query);
    req.msg = "admin_not_found";

    if (user) {
      let otp = helpers().generateOTP();

      await AdminService().updateProfile(user._id, { otp });

      req.rData = {};
      req.msg = "otp_sent_on_mail";
    } else {
      req.rCode = 0;
      req.msg = msg;
    }
    next();
  };

  const resetPassword = async (req, res, next) => {
    console.log("AdminController => resetPassword");
    let { newPassword, confirmPassword, adminId, subAdminId } = req.body;

    if (subAdminId) {
      adminId = subAdminId;
    }

    if (confirmPassword !== newPassword) {
      return res.status(400).send({
        code: 0,
        message: "confirmPassword and newPassword not matched!",
      });
    }

    let password = await helpers().hashPassword(newPassword);

    await AdminService().updateProfile(adminId, { password });

    req.msg = "password_changed";
    next();
  };

  const changePassword = async (req, res, next) => {
    console.log("AdminController => changePassword");
    let { currentPassword, newPassword, adminId, confirmPassword, subAdminId } =
      req.body;

    if (subAdminId) {
      adminId = subAdminId;
    }

    let passwordVerify = await AdminService().verifyPassword(
      adminId,
      currentPassword,
    );

    if (confirmPassword !== newPassword) {
      return res.status(400).send({
        code: 0,
        message: "confirmPassword and newPassword not matched!",
      });
    }

    if (!passwordVerify) {
      req.rCode = 0;
      req.msg = "incorrect_current_password";
      req.rData = {};
    } else {
      newPassword = await helpers().hashPassword(newPassword);

      await AdminService().resetPassword(adminId, newPassword);

      req.msg = "password_changed";
    }

    next();
  };

  /**
   * Banners
   */
  const addBanner = async (req, res, next) => {
    console.log("AdminController => addBanner");
    const bannerData = { ...req.body };

    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadRes = await fileUploadService.uploadFileToAws(file);
      // Assuming uploadRes.images contains the URL string
      console.log(uploadRes);
      bannerData.image = uploadRes.images;
    }

    const Banners = await BannersService().addBanners(bannerData);

    req.rData = Banners;
    req.msg = "success";
    next();
  };

  const updateBanner = async (req, res, next) => {
    console.log("AdminController => updateBanner");

    const { id } = req.params;
    const bannerData = { ...req.body };

    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadRes = await fileUploadService.uploadFileToAws(file);
      // Assuming uploadRes.images contains the URL string
      bannerData.image = uploadRes.images;
    }

    await BannersService().updateBanners(id, bannerData);

    const Banners = await BannersService().fetch(id);

    req.rData = Banners;

    req.msg = "success";
    next();
  };

  const getBanner = async (req, res, next) => {
    console.log("AdminController => getBanner");

    let { page, limit, isActive, search } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    let query = {};

    if (search) {
      query = {
        $or: [
          {
            title: { $regex: RegexEscape(search), $options: "i" },
          },
        ],
      };
    }

    if (isActive) query.isActive = isActive;

    let Banners = await BannersService().getBanners(query, page, limit);
    let total = await BannersService().countBanners(query);

    req.rData = { page, limit, isActive, total, banners: Banners };
    req.msg = "success";
    next();
  };

  const getBannerDetail = async (req, res, next) => {
    console.log("AdminController => getBannerDetail");
    let { id } = req.params;

    let Banners = await BannersService().fetch(id);

    req.rData = Banners;
    req.msg = "success";
    next();
  };

  const deleteBanner = async (req, res, next) => {
    console.log("AdminController => deleteBanner");
    let { bannerId } = req.body;

    await BannersService().deleteBanners(bannerId);

    req.msg = "success";
    next();
  };

  const activateDeactivateBanner = async (req, res, next) => {
    console.log("AdminController => activateDeactivateBanner");
    let { status, bannerId } = req.body;

    let banners = await BannersService().fetch(bannerId);

    if (banners) {
      if (banners.isActive == 0) {
        status = 1;
      } else {
        status = 0;
      }
      let banners_data = { isActive: status };
      banners = await BannersService().updateBanners(bannerId, banners_data);
    } else {
      return res
        .status(400)
        .send({ code: 0, message: "Banner not found!", data: {} });
    }

    req.msg = "status_changed";
    next();
  };

  /**
   * DeliveryCities
   */
  const addDeliveryCity = async (req, res, next) => {
    console.log("AdminController => addDeliveryCity");

    let { cityId } = req.body;

    let DeliveryCities = {};

    if (cityId) {
      await DeliveryCitiesService().updateDeliveryCities(cityId, req.body);

      DeliveryCities = await DeliveryCitiesService().fetch(cityId);
    } else {
      DeliveryCities = await DeliveryCitiesService().addDeliveryCities(
        req.body,
      );
    }

    req.rData = DeliveryCities;

    req.msg = "success";
    next();
  };

  const getDeliveryCity = async (req, res, next) => {
    console.log("AdminController => getDeliveryCity");

    let { page, limit, isActive, search } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    let query = {
      isDeleted: false,
    };

    if (search) {
      query = {
        $or: [
          {
            city: { $regex: RegexEscape(search), $options: "i" },
          },
          {
            state: { $regex: RegexEscape(search), $options: "i" },
          },
        ],
        isDeleted: false,
      };
    }

    if (isActive) query.isActive = isActive;

    let cities = await DeliveryCitiesService().getDeliveryCities(
      query,
      page,
      limit,
    );
    let total = await DeliveryCitiesService().countDeliveryCities(query);

    req.rData = { page, limit, isActive, search, total, cities };
    req.msg = "success";
    next();
  };

  const getDeliveryCityDetail = async (req, res, next) => {
    console.log("AdminController => getDeliveryCityDetail");
    let { id } = req.params;

    let cities = await DeliveryCitiesService().fetch(id);

    req.rData = cities;
    req.msg = "success";
    next();
  };

  const deleteDeliveryCity = async (req, res, next) => {
    console.log("AdminController => deleteDeliveryCity");
    let { cityId } = req.body;

    await DeliveryCitiesService().updateDeliveryCities(cityId, {
      isDeleted: true,
    });

    req.msg = "success";
    next();
  };

  const activateDeactivateDeliveryCity = async (req, res, next) => {
    console.log("AdminController => activateDeactivateDeliveryCity");
    let { status, cityId } = req.body;

    let city = await DeliveryCitiesService().fetch(cityId);

    if (city) {
      if (city.isActive == 0) {
        status = 1;
      } else {
        status = 0;
      }
      let city_data = { isActive: status };
      city = await DeliveryCitiesService().updateDeliveryCities(
        cityId,
        city_data,
      );
    } else {
      return res
        .status(400)
        .send({ code: 0, message: "City not found!", data: {} });
    }

    req.msg = "status_changed";
    next();
  };

  /**
   * Settings
   */

  const addTermAndCondition = async (req, res, next) => {
    console.log("AdminController => addTermAndCondition");

    let { termsAndConditions } = req.body;

    let Settings = await SettingsService().fetchByQuery({});

    if (
      Settings &&
      (Settings.termsAndConditions || Settings.termsAndConditions == "")
    ) {
      await SettingsService().updateSettings(Settings._id, {
        termsAndConditions,
      });
    } else {
      await SettingsService().addSettings({ termsAndConditions });
    }

    req.rData = {};

    req.msg = "success";
    next();
  };

  const addPrivacyPolicy = async (req, res, next) => {
    console.log("AdminController => addPrivacyPolicy");

    let { privacyPolicy } = req.body;

    let Settings = await SettingsService().fetchByQuery({});

    if (Settings && (Settings.privacyPolicy || Settings.privacyPolicy == "")) {
      await SettingsService().updateSettings(Settings._id, {
        privacyPolicy,
      });
    } else {
      await SettingsService().addSettings({ privacyPolicy });
    }

    req.rData = {};
    req.msg = "success";
    next();
  };

  const addAboutUs = async (req, res, next) => {
    console.log("AdminController => addAboutUs");

    let { aboutUs } = req.body;

    let Settings = await SettingsService().fetchByQuery({});

    if (Settings && (Settings.aboutUs || Settings.aboutUs == "")) {
      await SettingsService().updateSettings(Settings._id, {
        aboutUs,
      });
    } else {
      await SettingsService().addSettings({ aboutUs });
    }

    req.rData = {};
    req.msg = "success";
    next();
  };

  const addShippingPolicy = async (req, res, next) => {
    console.log("AdminController => addShippingPolicy");

    let { shippingPolicy } = req.body;

    let Settings = await SettingsService().fetchByQuery({});

    if (
      Settings &&
      (Settings.shippingPolicy || Settings.shippingPolicy == "")
    ) {
      await SettingsService().updateSettings(Settings._id, {
        shippingPolicy,
      });
    } else {
      await SettingsService().addSettings({ shippingPolicy });
    }

    req.rData = {};

    req.msg = "success";
    next();
  };

  const addCancellationPolicy = async (req, res, next) => {
    console.log("AdminController => addCancellationPolicy");

    let { cancellationPolicy } = req.body;

    let Settings = await SettingsService().fetchByQuery({});

    if (
      Settings &&
      (Settings.cancellationPolicy || Settings.cancellationPolicy == "")
    ) {
      await SettingsService().updateSettings(Settings._id, {
        cancellationPolicy,
      });
    } else {
      await SettingsService().addSettings({ cancellationPolicy });
    }

    req.rData = {};
    req.msg = "success";
    next();
  };

  const addRefundPolicy = async (req, res, next) => {
    console.log("AdminController => addRefundPolicy");

    let { refundPolicy } = req.body;

    let Settings = await SettingsService().fetchByQuery({});

    if (Settings && (Settings.refundPolicy || Settings.refundPolicy == "")) {
      await SettingsService().updateSettings(Settings._id, {
        refundPolicy,
      });
    } else {
      await SettingsService().addSettings({ refundPolicy });
    }

    req.rData = {};
    req.msg = "success";
    next();
  };

  const getTermAndCondition = async (req, res, next) => {
    console.log("AdminController => getTermAndCondition");
    let Settings = await SettingsService().fetchByQuery({});
    if (Settings) {
      req.rData = Settings.termsAndConditions;
    } else {
      req.rCode = 0;
      req.msg = "Settings_not_found";
      req.rData = {};
    }

    next();
  };

  const getPrivacyPolicy = async (req, res, next) => {
    console.log("AdminController => getPrivacyPolicy");
    let Settings = await SettingsService().fetchByQuery({});
    if (Settings) {
      req.rData = Settings.privacyPolicy;
    } else {
      req.rCode = 0;
      req.msg = "Settings_not_found";
      req.rData = {};
    }

    next();
  };

  const getAboutUs = async (req, res, next) => {
    console.log("AdminController => getAboutUs");
    let Settings = await SettingsService().fetchByQuery({});
    if (Settings) {
      req.rData = Settings.aboutUs;
    } else {
      req.rCode = 0;
      req.msg = "Settings_not_found";
      req.rData = {};
    }

    next();
  };

  const getShippingPolicy = async (req, res, next) => {
    console.log("AdminController => getShippingPolicy");
    let Settings = await SettingsService().fetchByQuery({});
    if (Settings) {
      req.rData = Settings.shippingPolicy;
    } else {
      req.rCode = 0;
      req.msg = "Settings_not_found";
      req.rData = {};
    }

    next();
  };

  const getCancellationPolicy = async (req, res, next) => {
    console.log("AdminController => getCancellationPolicy");
    let Settings = await SettingsService().fetchByQuery({});
    if (Settings) {
      req.rData = Settings.cancellationPolicy;
    } else {
      req.rCode = 0;
      req.msg = "Settings_not_found";
      req.rData = {};
    }

    next();
  };

  const getRefundPolicy = async (req, res, next) => {
    console.log("AdminController => getRefundPolicy");
    let Settings = await SettingsService().fetchByQuery({});
    if (Settings) {
      req.rData = Settings.refundPolicy;
    } else {
      req.rCode = 0;
      req.msg = "Settings_not_found";
      req.rData = {};
    }

    next();
  };

  /**
   * contactUs
   */

  const contactUs = async (req, res, next) => {
    console.log("AdminController => contactUs");

    let { contactUs } = req.body;

    let Settings = await SettingsService().fetchByQuery({});

    if (Settings) {
      await SettingsService().updateSettings(Settings._id, {
        contactUs,
      });
    } else {
      await SettingsService().addSettings({ contactUs });
    }

    req.rData = {};
    req.msg = "success";
    next();
  };

  const getContactUs = async (req, res, next) => {
    console.log("AdminController => getContactUs");
    let Settings = await SettingsService().fetchByQuery({});
    if (Settings) {
      req.rData = Settings.contactUs;
    } else {
      req.rCode = 0;
      req.msg = "Settings_not_found";
      req.rData = {};
    }

    next();
  };

  /**
   * FAQs
   */
  const addFaqs = async (req, res, next) => {
    console.log("AdminController => addFaqs");

    let { faqId } = req.body;

    let FAQs = {};

    if (faqId) {
      await FAQService().updateFAQ(faqId, req.body);

      FAQs = await FAQService().fetch(faqId);
    } else {
      FAQs = await FAQService().addFAQ(req.body);
    }

    req.rData = FAQs;

    req.msg = "success";
    next();
  };

  const Faqs = async (req, res, next) => {
    console.log("AdminController => Faqs");

    let { page, limit, isActive, search } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    let query = {
      isDeleted: false,
    };

    if (search) {
      query = {
        $or: [
          {
            question: { $regex: RegexEscape(search), $options: "i" },
          },
          {
            answer: { $regex: RegexEscape(search), $options: "i" },
          },
        ],
        isDeleted: false,
      };
    }

    if (isActive) query.isActive = isActive;

    let faqs = await FAQService().getFAQ(query, page, limit);
    let total = await FAQService().countFAQ(query);

    req.rData = { page, limit, isActive, search, total, faqs };
    req.msg = "success";
    next();
  };

  const faqsDetail = async (req, res, next) => {
    console.log("AdminController => faqsDetail");
    let { id } = req.params;

    let faqs = await FAQService().fetch(id);

    req.rData = faqs;
    req.msg = "success";
    next();
  };

  const deleteFaq = async (req, res, next) => {
    console.log("AdminController => deleteFaq");
    let { faqId } = req.body;

    await FAQService().updateFAQ(faqId, {
      isDeleted: true,
    });

    req.msg = "success";
    next();
  };

  const activateDeactivateFaqs = async (req, res, next) => {
    console.log("AdminController => activateDeactivateFaqs");
    let { status, faqId } = req.body;

    let faqs = await FAQService().fetch(faqId);

    if (faqs) {
      if (faqs.isActive == 0) {
        status = 1;
      } else {
        status = 0;
      }

      let faqs_data = { isActive: status };

      faqs = await FAQService().updateFAQ(faqId, faqs_data);
    } else {
      return res
        .status(400)
        .send({ code: 0, message: "FAQ not found!", data: {} });
    }

    req.msg = "status_changed";
    next();
  };

  /**
   * Brands
   */
  const addBrands = async (req, res, next) => {
    console.log("AdminController => addBrands");

    let brandId = req.params.id || req.body.brandId;
    let brandData = { ...req.body };

    if (req.files && req.files.image) {
      const uploadRes = await fileUploadService.uploadFileToAws(
        req.files.image
      );
      brandData.image = uploadRes.images;
    }

    let Brands = {};

    if (brandId) {
      await BrandsService().updateBrands(brandId, brandData);

      Brands = await BrandsService().fetch(brandId);
    } else {
      Brands = await BrandsService().addBrands(brandData);
    }

    req.rData = Brands;
    req.msg = "success";
    next();
  };

  const Brands = async (req, res, next) => {
    console.log("AdminController => Brands");

    let { page, limit, isActive, search } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    let query = { isDeleted: false };

    if (search) {
      query.brand = { $regex: RegexEscape(search), $options: "i" };
    }

    if (isActive) query.isActive = isActive;

    let brands = await BrandsService().getBrands(query, page, limit);
    let total = await BrandsService().countBrands(query);

    req.rData = { page, limit, isActive, total, brands };
    req.msg = "success";
    next();
  };

  const brandDetail = async (req, res, next) => {
    console.log("AdminController => brandDetail");
    let { id } = req.params;

    let brand = await BrandsService().fetch(id);

    req.rData = brand;
    req.msg = "success";
    next();
  };

  const deleteBrands = async (req, res, next) => {
    console.log("AdminController => deleteBrands");
    let brandId = req.params.id || req.body.brandId;

    await BrandsService().updateBrands(brandId, { isDeleted: true });

    req.msg = "success";
    next();
  };

  const activateDeactivateBrands = async (req, res, next) => {
    console.log("AdminController => activateDeactivateBrands");
    let brandId = req.params.id || req.body.brandId;
    let { status } = req.body;

    let brand = await BrandsService().fetch(brandId);

    if (brand) {
      if (brand.isActive == 0) {
        status = 1;
      } else {
        status = 0;
      }
      let brand_data = { isActive: status };
      brand = await BrandsService().updateBrands(brandId, brand_data);
    } else {
      return res
        .status(400)
        .send({ code: 0, message: "Brand not found!", data: {} });
    }

    req.msg = "status_changed";
    next();
  };

  // ==================== USER MANAGEMENT ====================

  const getUserDetail = async (req, res, next) => {
    console.log("AdminController => getUserDetail");
    const { id } = req.params;
    const user = await User.findById(id).select("-__v");
    if (!user) {
      req.rCode = 0;
      req.msg = "user_not_found";
      req.rData = {};
    } else {
      req.msg = "success";
      req.rData = user;
    }
    next();
  };

  const toggleUserStatus = async (req, res, next) => {
    console.log("AdminController => toggleUserStatus");
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      req.rCode = 0;
      req.msg = "user_not_found";
      req.rData = {};
    } else {
      user.isActive = !user.isActive;
      await user.save();
      req.msg = "status_changed";
      req.rData = { isActive: user.isActive };
    }
    next();
  };

  // ==================== PRODUCTS MANAGEMENT ====================

  const getAllProducts = async (req, res, next) => {
    console.log("AdminController => getAllProducts");
    let { search, page, limit, category, seller, isActive } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    let query = { isDeleted: false };
    if (search) {
      query.productName = { $regex: RegexEscape(search), $options: "i" };
    }
    if (category) query.categoryId = category;
    if (seller) query.shopId = seller;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (page - 1) * limit;
    const products = await Products.find(query)
      .populate("shopId", "shopName fullName mobile")
      .populate("categoryId", "categoryName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Products.countDocuments(query);

    req.msg = "success";
    req.rData = { page, limit, total, products };
    next();
  };

  const getProductDetail = async (req, res, next) => {
    console.log("AdminController => getProductDetail");
    const { id } = req.params;
    const product = await Products.findById(id)
      .populate("shopId", "shopName fullName mobile email")
      .populate("categoryId", "categoryName");

    if (!product) {
      req.rCode = 0;
      req.msg = "product_not_found";
      req.rData = {};
    } else {
      req.msg = "success";
      req.rData = product;
    }
    next();
  };

  const toggleProductStatus = async (req, res, next) => {
    console.log("AdminController => toggleProductStatus");
    const { id } = req.params;
    const product = await Products.findById(id);
    if (!product) {
      req.rCode = 0;
      req.msg = "product_not_found";
      req.rData = {};
    } else {
      product.isActive = !product.isActive;
      await product.save();
      req.msg = "status_changed";
      req.rData = { isActive: product.isActive };
    }
    next();
  };

  const deleteProduct = async (req, res, next) => {
    console.log("AdminController => deleteProduct");
    const { id } = req.params;
    await Products.findByIdAndUpdate(id, { isDeleted: true, isActive: false });
    req.msg = "success";
    req.rData = {};
    next();
  };

  // ==================== ORDERS MANAGEMENT ====================

  const getAllOrders = async (req, res, next) => {
    console.log("AdminController => getAllOrders");
    let { search, page, limit, status, paymentMode, paymentStatus } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    let query = {};
    if (status) query.status = status;
    if (paymentMode) query.paymentMode = paymentMode;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [{ orderId: { $regex: RegexEscape(search), $options: "i" } }];
    }

    const skip = (page - 1) * limit;
    const orders = await UserOrders.find(query)
      .populate("userId", "fullName mobileNumber email profileImages")
      .populate("products.sellerId", "shopName fullName")
      .populate("products.productId", "productName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserOrders.countDocuments(query);

    req.msg = "success";
    req.rData = { page, limit, total, orders };
    next();
  };

  const getOrderDetail = async (req, res, next) => {
    console.log("AdminController => getOrderDetail");
    const { id } = req.params;

    let order;
    // Try finding by MongoDB _id first, then by orderId string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await UserOrders.findById(id)
        .populate("userId", "fullName mobileNumber email profileImages")
        .populate("addressId")
        .populate("products.sellerId", "shopName fullName mobile")
        .populate("products.productId", "productName productImages");
    }
    if (!order) {
      order = await UserOrders.findOne({ orderId: id })
        .populate("userId", "fullName mobileNumber email profileImages")
        .populate("addressId")
        .populate("products.sellerId", "shopName fullName mobile")
        .populate("products.productId", "productName productImages");
    }

    if (!order) {
      req.rCode = 0;
      req.msg = "order_not_found";
      req.rData = {};
    } else {
      req.msg = "success";
      req.rData = order;
    }
    next();
  };

  const updateOrderStatus = async (req, res, next) => {
    console.log("AdminController => updateOrderStatus");
    const { id } = req.params;
    const { status: newStatus, adminNotes } = req.body;

    const order = await UserOrders.findById(id);
    if (!order) {
      req.rCode = 0;
      req.msg = "order_not_found";
      req.rData = {};
    } else {
      order.status = newStatus;
      if (adminNotes) order.adminNotes = adminNotes;
      if (newStatus === "cancelled") order.cancelledAt = new Date();
      if (newStatus === "delivered") order.actualDeliveryDate = new Date();
      await order.save();
      req.msg = "status_changed";
      req.rData = order;
    }
    next();
  };

  // ==================== DASHBOARD STATS ====================

  const getDashboardStats = async (req, res, next) => {
    console.log("AdminController => getDashboardStats");

    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalCategories,
      activeSellers,
      pendingSellers,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      Seller.countDocuments({ isDeleted: { $ne: true } }),
      Products.countDocuments({ isDeleted: { $ne: true } }),
      UserOrders.countDocuments({}),
      Category.countDocuments({ isDeleted: { $ne: true } }),
      Seller.countDocuments({ isActive: true, isDeleted: { $ne: true } }),
      Seller.countDocuments({
        status: "pending_approval",
        isDeleted: { $ne: true },
      }),
    ]);

    // Revenue aggregation
    const revenueAgg = await UserOrders.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Monthly revenue for chart (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const monthlyRevenue = await UserOrders.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent orders
    const recentOrders = await UserOrders.find({})
      .populate("userId", "fullName mobileNumber")
      .populate("products.sellerId", "shopName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Top sellers by order count
    const topSellers = await UserOrders.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.sellerId",
          orderCount: { $sum: 1 },
          revenue: { $sum: "$products.totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "sellers",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          orderCount: 1,
          revenue: 1,
          shopName: "$seller.shopName",
          fullName: "$seller.fullName",
        },
      },
    ]);

    // Category distribution
    const categoryDistribution = await Products.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, count: 1, name: "$category.categoryName" } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    req.msg = "success";
    req.rData = {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalCategories,
      totalRevenue,
      activeSellers,
      pendingSellers,
      monthlyRevenue,
      recentOrders,
      topSellers,
      categoryDistribution,
    };
    next();
  };

  /**
   * Delivery Settings
   */
  const getDeliverySettings = async (req, res, next) => {
    console.log("AdminController => getDeliverySettings");

    let settings = await DeliverySettings.findOne({ isActive: true });
    if (!settings) {
      settings = await DeliverySettings.create({});
    }

    req.rData = settings;
    req.msg = "success";
    next();
  };

  const updateDeliverySettings = async (req, res, next) => {
    console.log("AdminController => updateDeliverySettings");

    const {
      estimatedDeliveryTime,
      deliveryCharge,
      location,
      freeDeliveryAbove,
      maxDeliveryRadius,
    } = req.body;

    let settings = await DeliverySettings.findOne({ isActive: true });
    if (!settings) {
      settings = await DeliverySettings.create({});
    }

    settings = await DeliverySettings.findByIdAndUpdate(
      settings._id,
      {
        estimatedDeliveryTime,
        deliveryCharge,
        location,
        freeDeliveryAbove,
        maxDeliveryRadius,
        updatedAt: new Date(),
      },
      { new: true }
    );

    req.rData = settings;
    req.msg = "success";
    next();
  };

  return {
    login,
    register,
    editAdmin,
    getDetails,
    changePassword,
    addAdmin,
    forgotPassword,
    verifyOtpForForgotPassword,
    resendOtpForEmail,
    resetPassword,
    /**
     * Banners
     */
    getBanner,
    updateBanner,
    addBanner,
    deleteBanner,
    getBannerDetail,
    activateDeactivateBanner,
    /*
     * Setting
     */
    addTermAndCondition,
    addPrivacyPolicy,
    addAboutUs,
    addShippingPolicy,
    addRefundPolicy,
    addCancellationPolicy,
    getTermAndCondition,
    getPrivacyPolicy,
    getAboutUs,
    getRefundPolicy,
    getCancellationPolicy,
    getShippingPolicy,
    /**
     * ContactUs
     */
    contactUs,
    getContactUs,
    /**
     * FAQ
     */
    addFaqs,
    Faqs,
    faqsDetail,
    deleteFaq,
    activateDeactivateFaqs,
    /**
     * Brands
     */
    addBrands,
    Brands,
    brandDetail,
    deleteBrands,
    activateDeactivateBrands,
    /**
     * Users Management
     */
    getUserDetail,
    toggleUserStatus,
    /**
     * Delivery Settings
     */
    getDeliverySettings,
    updateDeliverySettings,
    /**
     * Products Management
     */
    getAllProducts,
    getProductDetail,
    toggleProductStatus,
    deleteProduct,
    /**
     * Orders Management
     */
    getAllOrders,
    getOrderDetail,
    updateOrderStatus,
    /**
     * Dashboard
     */
    getDashboardStats,
  };
};
