module.exports = () => {
  const CustomerService = require("../services/CustomerService")();

  /**
   * GET /v1/api/customer/sellers
   * Get all sellers with pagination and filters
   */
  const getSellers = async (req, res, next) => {
    console.log("CustomerController => getSellers");
    await CustomerService.getAllSellers(req, res, next);
  };

  /**
   * GET /v1/api/customer/sellers/:sellerId
   * Get seller details
   */
  const getSellerDetail = async (req, res, next) => {
    console.log("CustomerController => getSellerDetail");
    await CustomerService.getSellerDetails(req, res, next);
  };

  /**
   * GET /v1/api/customer/sellers/:sellerId/categories
   * Get seller categories
   */
  const getSellerCategoriesDetail = async (req, res, next) => {
    console.log("CustomerController => getSellerCategoriesDetail");
    await CustomerService.getSellerCategories(req, res, next);
  };

  /**
   * GET /v1/api/customer/sellers/:sellerId/products
   * Get products by seller and category
   */
  const getSellerProductsList = async (req, res, next) => {
    console.log("CustomerController => getSellerProductsList");
    await CustomerService.getSellerProducts(req, res, next);
  };

  /**
   * GET /v1/api/user/brands/:brandId/products
   * Popular Brand tile: us brand ke products
   */
  const getBrandProductsList = async (req, res, next) => {
    console.log("CustomerController => getBrandProductsList");
    await CustomerService.getBrandProducts(req, res, next);
  };

  /**
   * GET /v1/api/customer/products/:productId
   * Get product details
   */
  const getProductDetail = async (req, res, next) => {
    console.log("CustomerController => getProductDetail");
    await CustomerService.getProductDetails(req, res, next);
  };

  /**
   * GET /v1/api/customer/products/search
   * Search products
   */
  const searchProductsList = async (req, res, next) => {
    console.log("CustomerController => searchProductsList");
    await CustomerService.searchProducts(req, res, next);
  };

  return {
    getSellers,
    getSellerDetail,
    getSellerCategoriesDetail,
    getSellerProductsList,
    getBrandProductsList,
    getProductDetail,
    searchProductsList,
  };
};
