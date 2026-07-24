module.exports = () => {
  const CartService = require("../services/CartService")();

  /**
   * GET /v1/api/customer/cart
   * Get user cart
   */
  const getCartData = async (req, res, next) => {
    console.log("CartController => getCartData");
    await CartService.getCart(req, res, next);
  };

  /**
   * POST /v1/api/customer/cart/add
   * Add item to cart
   */
  const addItemToCart = async (req, res, next) => {
    console.log("CartController => addItemToCart");
    await CartService.addToCart(req, res, next);
  };

  /**
   * PUT /v1/api/customer/cart/items/:itemId
   * Update cart item quantity
   */
  const updateItemQuantity = async (req, res, next) => {
    console.log("CartController => updateItemQuantity");
    await CartService.updateCartItem(req, res, next);
  };

  /**
   * DELETE /v1/api/customer/cart/items/:itemId
   * Remove item from cart
   */
  const removeItemFromCart = async (req, res, next) => {
    console.log("CartController => removeItemFromCart");
    await CartService.removeFromCart(req, res, next);
  };

  /**
   * POST /v1/api/customer/cart/apply-coupon
   * Apply coupon code
   */
  const applyCouponCode = async (req, res, next) => {
    console.log("CartController => applyCouponCode");
    await CartService.applyCoupon(req, res, next);
  };

  /**
   * DELETE /v1/api/customer/cart/coupon
   * Remove coupon
   */
  const removeCouponCode = async (req, res, next) => {
    console.log("CartController => removeCouponCode");
    await CartService.removeCoupon(req, res, next);
  };

  /**
   * POST /v1/api/customer/cart/delivery-address
   * Save delivery address
   */
  const setDeliveryAddress = async (req, res, next) => {
    console.log("CartController => setDeliveryAddress");
    await CartService.saveDeliveryAddress(req, res, next);
  };

  /**
   * DELETE /v1/api/customer/cart
   * Clear cart
   */
  const emptyCart = async (req, res, next) => {
    console.log("CartController => emptyCart");
    await CartService.clearCart(req, res, next);
  };

  return {
    getCartData,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    applyCouponCode,
    removeCouponCode,
    setDeliveryAddress,
    emptyCart,
  };
};
