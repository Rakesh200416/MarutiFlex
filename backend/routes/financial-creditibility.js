const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FinancialCreditibility = require('../models/FinancialCreditibility');
const Order = require('../models/Order');

// create new financial creditibility record
router.post('/', auth, async (req, res) => {
  try {
    const fcData = req.body;
    console.log('Financial Credibility POST body:', fcData);
    fcData.user = req.user.id;
    
    // Validate required fields
    if (!fcData.overdueOfParty || !fcData.creditLimitIfAccess || !fcData.informationToCRM || !fcData.whetherOrderProcessed) {
      console.warn('Validation failed - missing fields:', { overdueOfParty: !fcData.overdueOfParty, creditLimitIfAccess: !fcData.creditLimitIfAccess, informationToCRM: !fcData.informationToCRM, whetherOrderProcessed: !fcData.whetherOrderProcessed });
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const fc = new FinancialCreditibility(fcData);
    await fc.save();
    console.log('Financial Credibility saved:', fc._id);
    
    // Update Order with this stage reference
    if (req.body.orderId) {
      await Order.findByIdAndUpdate(req.body.orderId, { financialCreditibility: fc._id });
      console.log('Order updated with financialCreditibility:', req.body.orderId);
    }
    
    res.json(fc.toJSON ? fc.toJSON() : fc.toObject());
  } catch (err) {
    console.error('Financial Credibility Error:', err.message);
    console.error('Error stack:', err.stack);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: messages.join(', '), details: err.errors });
    }
    res.status(500).json({ message: err.message || 'Server error', error: err.message });
  }
});

// get all financial creditibility records for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const records = await FinancialCreditibility.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get financial creditibility record by id
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await FinancialCreditibility.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// update financial creditibility record
router.put('/:id', auth, async (req, res) => {
  try {
    let record = await FinancialCreditibility.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    record = await FinancialCreditibility.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete financial creditibility record
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await FinancialCreditibility.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await FinancialCreditibility.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
