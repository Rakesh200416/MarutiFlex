const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const OrderInvoice = require('../models/OrderInvoice');
const Order = require('../models/Order');

// POST: create new order invoice record
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, priceInvoiceChecked, freightInvoiceChecked, quantityChecked, needToHighlight, remarks } = req.body;
    
    if (!priceInvoiceChecked || !freightInvoiceChecked || !quantityChecked || !needToHighlight) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const data = {
      user: req.user.id,
      priceInvoiceChecked,
      freightInvoiceChecked,
      quantityChecked,
      needToHighlight,
      remarks: remarks || ''
    };

    const oi = new OrderInvoice(data);
    await oi.save();
    console.log('Order Invoice saved:', oi._id);

    // Update Order with this stage reference
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { orderInvoice: oi._id });
      console.log('Order updated with orderInvoice:', orderId);
    }

    const saved = await OrderInvoice.findById(oi._id);
    res.json(saved);
  } catch (err) {
    console.error('OrderInvoice Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET: list user's order invoice records
router.get('/', auth, async (req, res) => {
  try {
    const records = await OrderInvoice.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: single record
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // validate id format before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID parameter' });
    }
    const record = await OrderInvoice.findById(id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
