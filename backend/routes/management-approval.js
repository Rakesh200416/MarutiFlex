const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ManagementApproval = require('../models/ManagementApproval');
const Order = require('../models/Order');

// create new management approval record
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, financialCreditibilityId, approvalStatus, remarks } = req.body;

    if (!financialCreditibilityId || !approvalStatus || !remarks) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const maData = {
      user: req.user.id,
      financialCreditibility: financialCreditibilityId,
      approvalStatus,
      remarks
    };

    const ma = new ManagementApproval(maData);
    await ma.save();
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { managementApproval: ma._id });
    }
    
    const savedMA = await ManagementApproval.findById(ma._id).populate('financialCreditibility');
    res.json(savedMA.toJSON ? savedMA.toJSON() : savedMA.toObject());
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get all management approval records for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const records = await ManagementApproval.find({ user: req.user.id })
      .populate('financialCreditibility')
      .sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get management approval record by id
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await ManagementApproval.findById(req.params.id)
      .populate('financialCreditibility');
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

// update management approval record
router.put('/:id', auth, async (req, res) => {
  try {
    let record = await ManagementApproval.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    record = await ManagementApproval.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('financialCreditibility');
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete management approval record
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await ManagementApproval.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await ManagementApproval.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
