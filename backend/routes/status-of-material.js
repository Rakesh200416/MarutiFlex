const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StatusOfMaterial = require('../models/StatusOfMaterial');
const Order = require('../models/Order');

// POST: create new status of material record
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, receiptFromClientId, materialReachedOnTime } = req.body;
    if (!materialReachedOnTime) {
      return res.status(400).json({ message: 'Material status is required' });
    }

    const data = {
      user: req.user.id,
      receiptFromClient: receiptFromClientId || null,
      materialReachedOnTime
    };

    const som = new StatusOfMaterial(data);
    await som.save();
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { statusOfMaterial: som._id });
    }
    
    const saved = await StatusOfMaterial.findById(som._id);
    res.json(saved);
  } catch (err) {
    console.error('StatusOfMaterial Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET: list user's status of material records
router.get('/', auth, async (req, res) => {
  try {
    const records = await StatusOfMaterial.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: single record
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await StatusOfMaterial.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
