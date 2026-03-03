const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

// create new order
router.post('/', auth, async (req, res) => {
  try {
    const orderData = req.body;
    orderData.user = req.user.id;
    const order = new Order(orderData);
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// get all orders for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('financialCreditibility')
      .populate('managementApproval')
      .populate('finalOrder')
      .populate('arrangeVehicle')
      .populate('billing')
      .populate('receiptFromClient')
      .populate('statusOfMaterial')
      .populate('orderInvoice')
      .populate('deliveryInfo')
      .populate('feedback')
      .sort({ dateCreated: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// get single order by id (used by frontend details fetch)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('financialCreditibility')
      .populate('managementApproval')
      .populate('finalOrder')
      .populate('arrangeVehicle')
      .populate('billing')
      .populate('receiptFromClient')
      .populate('statusOfMaterial')
      .populate('orderInvoice')
      .populate('deliveryInfo')
      .populate('feedback');
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// update order by id
router.put('/:id', auth, async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    order = await Order.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// delete order
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await order.remove();
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;