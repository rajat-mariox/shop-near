const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Seller = require("../models/Seller");
const CouponCode = require("../models/CouponCode");

module.exports = () => {
  /**
   * Get user cart
   * GET /v1/api/customer/cart
   */
  const getCart = async (req, res, next) => {
    console.log("CartService => getCart");

    try {
      const userId = req.body.userId; // From auth middleware

      let cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      })
        .populate({
          path: "items.productId",
          select: "productName productImages price discountPrice",
        })
        .populate({
          path: "items.sellerId",
          select: "shopName shopLogo deliveryTime deliveryCharge",
        });

      if (!cart) {
        req.rData = {
          items: [],
          subtotal: 0,
          deliveryCharge: 0,
          discountAmount: 0,
          taxAmount: 0,
          total: 0,
          itemCount: 0,
        };
        req.msg = "Cart is empty";
        return next();
      }

      // Format cart items
      const formattedCart = {
        _id: cart._id,
        items: cart.items.map((item) => ({
          _id: item._id,
          product: {
            _id: item.productId?._id,
            productName: item.productId?.productName,
            productImage: item.productImage,
          },
          seller: {
            _id: item.sellerId?._id,
            shopName: item.sellerId?.shopName,
            shopLogo: item.sellerId?.shopLogo,
            deliveryTime: item.sellerId?.deliveryTime,
            deliveryCharge: item.sellerId?.deliveryCharge,
          },
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          price: item.price,
          discountPrice: item.discountPrice,
          itemTotal: item.discountPrice * item.quantity,
        })),
        subtotal: cart.subtotal,
        deliveryCharge: cart.deliveryCharge,
        discountAmount: cart.discountAmount,
        taxAmount: cart.taxAmount,
        total: cart.total,
        appliedCoupon: cart.appliedCoupon,
        deliveryAddress: cart.deliveryAddress,
        itemCount: cart.items.length,
      };

      req.rData = formattedCart;
      req.msg = "Cart fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getCart:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Add item to cart
   * POST /v1/api/customer/cart/add
   */
  const addToCart = async (req, res, next) => {
    console.log("CartService => addToCart");

    try {
      const {
        productId,
        sellerId,
        quantity,
        selectedColor,
        selectedSize,
        userId,
      } = req.body;

      console.log(req.body);
      // Validate input
      if (!productId || !sellerId || !quantity) {
        req.error = "Product ID, Seller ID, and Quantity are required";
        return next();
      }

      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        req.error = "Product not found";
        return next();
      }

      // Check stock
      if (product.stock < quantity) {
        req.error = `Only ${product.stock} items available in stock`;
        return next();
      }

      // Get seller details
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        req.error = "Seller not found";
        return next();
      }

      // Get or create cart
      let cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });

      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          subtotal: 0,
          deliveryCharge: seller.deliveryCharge || 0,
          total: 0,
        });
      }

      // Check if item already exists
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.sellerId.toString() === sellerId &&
          item.selectedSize === selectedSize &&
          item.selectedColor?.name === selectedColor?.name
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          sellerId,
          quantity,
          selectedColor,
          selectedSize,
          price: product.price,
          discountPrice: product.discountPrice || product.price,
          productName: product.productName,
          productImage: product.productImages?.[0]?.url,
        });
      }

      // Calculate totals
      let subtotal = 0;
      cart.items.forEach((item) => {
        subtotal += item.discountPrice * item.quantity;
      });

      cart.subtotal = subtotal;
      cart.deliveryCharge = seller.deliveryCharge || 0;
      cart.taxAmount = Math.round(subtotal * 0.18); // 18% GST
      cart.total =
        cart.subtotal +
        cart.deliveryCharge +
        cart.taxAmount -
        cart.discountAmount;

      await cart.save();

      req.rData = {
        cartId: cart._id,
        itemCount: cart.items.length,
        subtotal: cart.subtotal,
        total: cart.total,
      };

      req.msg = "Item added to cart successfully";
      next();
    } catch (error) {
      console.error("Error in addToCart:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Update cart item quantity
   * PUT /v1/api/customer/cart/items/:itemId
   */
  const updateCartItem = async (req, res, next) => {
    console.log("CartService => updateCartItem");

    try {
      const userId = req.body.userId;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        req.error = "Quantity must be greater than 0";
        return next();
      }

      const cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });
      if (!cart) {
        req.error = "Cart not found";
        return next();
      }

      const item = cart.items.find((i) => i._id.toString() === itemId);
      if (!item) {
        req.error = "Item not found in cart";
        return next();
      }

      // Check stock
      const product = await Product.findById(item.productId);
      if (product.stock < quantity) {
        req.error = `Only ${product.stock} items available in stock`;
        return next();
      }

      item.quantity = quantity;

      // Recalculate totals
      let subtotal = 0;
      cart.items.forEach((item) => {
        subtotal += item.discountPrice * item.quantity;
      });

      cart.subtotal = subtotal;
      cart.taxAmount = Math.round(subtotal * 0.18);
      cart.total =
        cart.subtotal +
        cart.deliveryCharge +
        cart.taxAmount -
        cart.discountAmount;

      await cart.save();

      req.rData = {
        cartId: cart._id,
        itemCount: cart.items.length,
        subtotal: cart.subtotal,
        total: cart.total,
      };

      req.msg = "Cart item updated successfully";
      next();
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Remove item from cart
   * DELETE /v1/api/customer/cart/items/:itemId
   */
  const removeFromCart = async (req, res, next) => {
    console.log("CartService => removeFromCart");

    try {
      const userId = req.body.userId;
      const { itemId } = req.params;

      const cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });
      if (!cart) {
        req.error = "Cart not found";
        return next();
      }

      cart.items = cart.items.filter((i) => i._id.toString() !== itemId);

      // Recalculate totals
      let subtotal = 0;
      cart.items.forEach((item) => {
        subtotal += item.discountPrice * item.quantity;
      });

      cart.subtotal = subtotal;
      cart.taxAmount = Math.round(subtotal * 0.18);
      cart.total =
        cart.subtotal +
        cart.deliveryCharge +
        cart.taxAmount -
        cart.discountAmount;

      // If cart is empty, mark as inactive
      if (cart.items.length === 0) {
        cart.isActive = false;
      }

      await cart.save();

      req.rData = {
        cartId: cart._id,
        itemCount: cart.items.length,
        subtotal: cart.subtotal,
        total: cart.total,
      };

      req.msg = "Item removed from cart successfully";
      next();
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Apply coupon code
   * POST /v1/api/customer/cart/apply-coupon
   */
  const applyCoupon = async (req, res, next) => {
    console.log("CartService => applyCoupon");

    try {
      const userId = req.body.userId;
      const { couponCode } = req.body;

      if (!couponCode) {
        req.error = "Coupon code is required";
        return next();
      }

      const cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });
      if (!cart) {
        req.error = "Cart not found";
        return next();
      }

      // Find coupon
      const coupon = await CouponCode.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        req.error = "Invalid coupon code";
        return next();
      }

      // Check minimum order value
      if (cart.subtotal < coupon.minOrderValue) {
        req.error = `Minimum order value of ₹${coupon.minOrderValue} required`;
        return next();
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = Math.round(
          (cart.subtotal * coupon.discountValue) / 100
        );
      } else {
        discountAmount = coupon.discountValue;
      }

      // Apply coupon
      cart.appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };
      cart.discountAmount = discountAmount;
      cart.total =
        cart.subtotal + cart.deliveryCharge + cart.taxAmount - discountAmount;

      await cart.save();

      req.rData = {
        appliedCoupon: cart.appliedCoupon,
        discountAmount: cart.discountAmount,
        total: cart.total,
      };

      req.msg = "Coupon applied successfully";
      next();
    } catch (error) {
      console.error("Error in applyCoupon:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Remove coupon
   * DELETE /v1/api/customer/cart/coupon
   */
  const removeCoupon = async (req, res, next) => {
    console.log("CartService => removeCoupon");

    try {
      const userId = req.body.userId;

      const cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });
      if (!cart) {
        req.error = "Cart not found";
        return next();
      }

      cart.appliedCoupon = null;
      cart.discountAmount = 0;
      cart.total = cart.subtotal + cart.deliveryCharge + cart.taxAmount;

      await cart.save();

      req.rData = {
        subtotal: cart.subtotal,
        deliveryCharge: cart.deliveryCharge,
        taxAmount: cart.taxAmount,
        discountAmount: 0,
        total: cart.total,
      };

      req.msg = "Coupon removed successfully";
      next();
    } catch (error) {
      console.error("Error in removeCoupon:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Save delivery address
   * POST /v1/api/customer/cart/delivery-address
   */
  const saveDeliveryAddress = async (req, res, next) => {
    console.log("CartService => saveDeliveryAddress");

    try {
      const userId = req.body.userId;
      const { name, phone, email, address, city, pincode, lat, lng } = req.body;

      if (!address || !city || !pincode) {
        req.error = "Address, City, and Pincode are required";
        return next();
      }

      const cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });
      if (!cart) {
        req.error = "Cart not found";
        return next();
      }

      cart.deliveryAddress = {
        userId,
        name,
        phone,
        email,
        address,
        city,
        pincode,
        lat,
        lng,
      };

      await cart.save();

      req.rData = {
        deliveryAddress: cart.deliveryAddress,
      };

      req.msg = "Delivery address saved successfully";
      next();
    } catch (error) {
      console.error("Error in saveDeliveryAddress:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Clear cart
   * DELETE /v1/api/customer/cart
   */
  const clearCart = async (req, res, next) => {
    console.log("CartService => clearCart");

    try {
      const userId = req.body.userId;

      const cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });
      if (!cart) {
        req.error = "Cart not found";
        return next();
      }

      cart.items = [];
      cart.isActive = false;
      cart.subtotal = 0;
      cart.total = 0;

      await cart.save();

      req.rData = { message: "Cart cleared successfully" };
      req.msg = "Cart cleared successfully";
      next();
    } catch (error) {
      console.error("Error in clearCart:", error);
      req.error = error.message;
      next();
    }
  };

  return {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    saveDeliveryAddress,
    clearCart,
  };
};
