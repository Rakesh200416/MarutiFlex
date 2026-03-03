const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DeliveryInfoToClient = require('../models/DeliveryInfoToClient');
const Order = require('../models/Order');

// POST: create new delivery info to client record
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, informedAboutDelay } = req.body;
    if (!informedAboutDelay) {
      return res.status(400).json({ message: 'Informed status is required' });
    }

    const data = {
      user: req.user.id,
      informedAboutDelay
    };

    const ditc = new DeliveryInfoToClient(data);
    await ditc.save();
    console.log('Delivery Info saved:', ditc._id);

    // Update Order with this stage reference
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { deliveryInfo: ditc._id });
      console.log('Order updated with deliveryInfo:', orderId);
    }

    const saved = await DeliveryInfoToClient.findById(ditc._id);
    res.json(saved);
  } catch (err) {
    console.error('DeliveryInfoToClient Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET: list user's delivery info records
router.get('/', auth, async (req, res) => {
  try {
    const records = await DeliveryInfoToClient.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: single record
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await DeliveryInfoToClient.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
