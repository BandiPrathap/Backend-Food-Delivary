//controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User'); // to access user data
const Cart = require('../models/Cart'); // if using a Cart model

const { calculateOrderTotal } = require('./utils/orderUtils'); // helper function

const createOrder = async (req, res) => {
  const userId = req.user.userId; // assuming user data from middleware

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Access cart items and calculate total (if using Cart model)
    let cartItems, totalPrice;
    if (Cart) {
      const cart = await Cart.findOne({ user: userId });
      cartItems = cart.items;
      totalPrice = cart.totalPrice;
    } else {
      // Implement logic to retrieve cart items from elsewhere (e.g., session)
      // Calculate totalPrice based on retrieved cart items
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const order = new Order({
      user,
      items: cartItems,
      totalPrice: totalPrice
    });

    await order.save();

    // Clear cart after successful order creation (if using Cart model)
    if (Cart) {
      await Cart.deleteOne({ user: userId });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrderHistory = async (req, res) => {
  const userId = req.user.userId; // assuming user data from middleware

  try {
    const orders = await Order.find({ user: userId });
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

