const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FinalOrder = require('../models/FinalOrder');
const Order = require('../models/Order');

// create new final order record
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, financialCreditibilityId, managementApprovalId, orderStatus, cancelledReason, otherReason, finalOrder, partDelivery, managementApprovalScreenshot } = req.body;

    // debug log request body
    console.log('FinalOrder POST body:', req.body);

    // managementApprovalId is optional (null when skipping management approval)
    const missing = [];
    if (!financialCreditibilityId) missing.push('financialCreditibilityId');
    if (!orderStatus) missing.push('orderStatus');
    if (!finalOrder || (typeof finalOrder === 'string' && !finalOrder.trim())) missing.push('finalOrder');
    if (!partDelivery) missing.push('partDelivery');
    if (missing.length) {
      console.warn('FinalOrder validation failed, missing:', missing);
      return res.status(400).json({ message: 'All required fields must be provided', missing });
    }

    // Validate orderStatus is one of the allowed values
    if (!['Proceed', 'Support'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status. Must be "Proceed" or "Support"' });
    }

    // Validate partDelivery is one of the allowed values
    if (!['Yes', 'No'].includes(partDelivery)) {
      return res.status(400).json({ message: 'Invalid part delivery value. Must be "Yes" or "No"' });
    }

    if (orderStatus === 'Support' && !cancelledReason) {
      return res.status(400).json({ message: 'Cancellation reason is required when status is Support' });
    }

    if (orderStatus === 'Support' && !['Non Availability of Materials', 'Delay in Delivery', 'Other'].includes(cancelledReason)) {
      return res.status(400).json({ message: 'Invalid cancellation reason: ' + cancelledReason });
    }

    if (cancelledReason === 'Other' && !otherReason) {
      return res.status(400).json({ message: 'Other reason description is required when "Other" is selected' });
    }

    const foData = {
      user: req.user.id,
      financialCreditibility: financialCreditibilityId,
      managementApproval: managementApprovalId || null,
      orderStatus,
      cancelledReason: orderStatus === 'Support' ? (cancelledReason || null) : null,
      otherReason: cancelledReason === 'Other' && orderStatus === 'Support' ? otherReason : null,
      finalOrder: String(finalOrder).trim(),
      partDelivery,
      managementApprovalScreenshot: managementApprovalScreenshot || null
    };

    const fo = new FinalOrder(foData);
    console.log('Creating FinalOrder with data:', foData);
    await fo.save();
    console.log('FinalOrder saved successfully:', fo._id);
    
    // Update Order with reference to finalOrder
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { finalOrder: fo._id });
      console.log('Updated Order', orderId, 'with finalOrder reference:', fo._id);
    }
    
    const savedFO = await FinalOrder.findById(fo._id)
      .populate('financialCreditibility')
      .populate('managementApproval');
    res.json(savedFO.toJSON ? savedFO.toJSON() : savedFO.toObject());
  } catch (err) {
    console.error('Final Order Error:', err.message);
    if (err.errors) {
      console.error('Validation errors:', Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`));
    }
    console.error('Full error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message, details: err.errors ? Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`) : null });
  }
});

// get all final order records for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const records = await FinalOrder.find({ user: req.user.id })
      .populate('financialCreditibility')
      .populate('managementApproval')
      .sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get final order record by id
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await FinalOrder.findById(req.params.id)
      .populate('financialCreditibility')
      .populate('managementApproval');
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

// update final order record
router.put('/:id', auth, async (req, res) => {
  try {
    let record = await FinalOrder.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    record = await FinalOrder.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('financialCreditibility')
      .populate('managementApproval');
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete final order record
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await FinalOrder.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await FinalOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
