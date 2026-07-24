"use strict";

const CategoryService = require("../services/CategoryService");
const fileUploadService = require("../util/s3");
const RegexEscape = require("regex-escape");

module.exports = () => {
  /**
   * ADD CATEGORY
   */
  const addCategory = async (req, res, next) => {
    const data = { ...req.body };

    // Image multipart file (field: "image") ya seedhi URL string, dono chalti hain
    if (req.files && req.files.image) {
      const uploadRes = await fileUploadService.uploadFileToAws(req.files.image);
      data.image = uploadRes.images;
    }

    const category = await CategoryService().addCategory(data);

    req.msg = "category_added";
    req.rData = category;
    next();
  };

  /**
   * EDIT CATEGORY
   */
  const editCategory = async (req, res, next) => {
    const { id } = req.params;
    const data = { ...req.body };

    if (req.files && req.files.image) {
      const uploadRes = await fileUploadService.uploadFileToAws(req.files.image);
      data.image = uploadRes.images;
    }

    await CategoryService().updateCategory(id, data);
    const category = await CategoryService().fetch(id);

    req.msg = "category_updated";
    req.rData = category;
    next();
  };

  /**
   * GET CATEGORY BY ID
   */
  const getCategoryById = async (req, res, next) => {
    const { id } = req.params;

    const category = await CategoryService().fetchById(id);

    if (!category) {
      req.rCode = 0;
      req.msg = "category_not_found";
      req.rData = {};
      return next();
    }

    req.msg = "success";
    req.rData = category;
    next();
  };

  /**
   * GET ALL CATEGORIES (SEARCH + PAGINATION)
   */
  const getAllCategories = async (req, res, next) => {
    console.log("CategoryController => getAllCategories");
    let { search, page = 1, limit = 10, isActive } = req.query;

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    const query = { isDeleted: false };

    if (search) {
      query.categoryName = {
        $regex: RegexEscape(search),
        $options: "i",
      };
    }

    if (isActive) {
      query.isActive = isActive;
    } else {
      query.isActive = true;
    }

    const categories = await CategoryService().getCategory(query, page, limit);
    const total = await CategoryService().countCategory(query);

    req.msg = "category_list";
    req.rData = {
      page,
      limit,
      total,
      categories,
    };
    next();
  };

  /**
   * ACTIVATE / DEACTIVATE CATEGORY
   */
  const toggleCategoryStatus = async (req, res, next) => {
    const { id } = req.params;

    const category = await CategoryService().fetchById(id);

    if (!category) {
      req.rCode = 0;
      req.msg = "category_not_found";
      return next();
    }

    const updated = await CategoryService().updateCategory(id, {
      isActive: !category.isActive,
    });

    req.msg = "status_changed";
    req.rData = updated;
    next();
  };

  /**
   * DELETE CATEGORY (SOFT DELETE)
   */
  const deleteCategory = async (req, res, next) => {
    const { id } = req.params;

    await CategoryService().updateCategory(id, { isDeleted: true });

    req.msg = "category_deleted";
    next();
  };

  return {
    addCategory,
    editCategory,
    getCategoryById,
    getAllCategories,
    toggleCategoryStatus,
    deleteCategory,
  };
};
