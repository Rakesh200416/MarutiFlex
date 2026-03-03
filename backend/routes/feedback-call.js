const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FeedbackCall = require('../models/FeedbackCall');
const Order = require('../models/Order');

// POST: create new feedback call record
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, customerPickedCall } = req.body;
    if (!customerPickedCall) {
      return res.status(400).json({ message: 'Customer call status is required' });
    }

    const data = {
      user: req.user.id,
      customerPickedCall
    };

    const fc = new FeedbackCall(data);
    await fc.save();
    console.log('Feedback Call saved:', fc._id);

    // Update Order with this stage reference
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { feedback: fc._id });
      console.log('Order updated with feedback:', orderId);
    }

    const saved = await FeedbackCall.findById(fc._id);
    res.json(saved);
  } catch (err) {
    console.error('FeedbackCall Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET: list user's feedback call records
router.get('/', auth, async (req, res) => {
  try {
    const records = await FeedbackCall.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: single record
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await FeedbackCall.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
