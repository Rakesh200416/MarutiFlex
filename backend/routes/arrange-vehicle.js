const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ArrangeVehicle = require('../models/ArrangeVehicle');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'arrange-vehicle');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage });

// create new arrange vehicle record
// accept multipart/form-data for attachments
router.post('/', auth, upload.fields([
  { name: 'loadingAttachment', maxCount: 1 },
  { name: 'challanAttachment', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      orderId,
      finalOrderId,
      vehicleArrangementDetails,
      vehicleType,
      vehicleNumber,
      driverName,
      driverPhone,
      deliveryType,
      remark,
      actualFreight
    } = req.body;

    if (!finalOrderId || !vehicleArrangementDetails) {
      return res.status(400).json({ message: 'Final Order ID and vehicle arrangement details are required' });
    }

    const avData = {
      user: req.user.id,
      finalOrder: finalOrderId,
      vehicleArrangementDetails,
      vehicleType: vehicleType || null,
      vehicleNumber: vehicleNumber || null,
      driverName: driverName || null,
      driverPhone: driverPhone || null,
      deliveryType: deliveryType || null,
      remark: remark || null,
      actualFreight: actualFreight ? Number(actualFreight) : 0,
      loadingAttachment: req.files && req.files.loadingAttachment ? path.join('uploads', 'arrange-vehicle', req.files.loadingAttachment[0].filename).replace(/\\/g, '/') : null,
      challanAttachment: req.files && req.files.challanAttachment ? path.join('uploads', 'arrange-vehicle', req.files.challanAttachment[0].filename).replace(/\\/g, '/') : null
    };

    const av = new ArrangeVehicle(avData);
    await av.save();
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { arrangeVehicle: av._id });
    }
    
    const savedAV = await ArrangeVehicle.findById(av._id).populate('finalOrder');
    res.json(savedAV.toJSON ? savedAV.toJSON() : savedAV.toObject());
  } catch (err) {
    console.error('Arrange Vehicle Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// get all arrange vehicle records for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const records = await ArrangeVehicle.find({ user: req.user.id })
      .populate('finalOrder')
      .sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get arrange vehicle record by id
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await ArrangeVehicle.findById(req.params.id)
      .populate('finalOrder');
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

// update mark as loading completed
router.put('/:id/loading-complete', auth, async (req, res) => {
  try {
    let record = await ArrangeVehicle.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    record.loadingCompleted = true;
    record.loadingDate = new Date();
    record.status = 'Loading Completed';
    await record.save();

    const updated = await ArrangeVehicle.findById(record._id).populate('finalOrder');
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// update notify accounts for billing
router.put('/:id/billing-notify', auth, async (req, res) => {
  try {
    const { billingRemarks } = req.body;
    let record = await ArrangeVehicle.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    record.billingSentToAccounts = true;
    record.accountsNotificationDate = new Date();
    record.billingRemarks = billingRemarks || '';
    record.status = 'Accounts Notified';
    await record.save();

    const updated = await ArrangeVehicle.findById(record._id).populate('finalOrder');
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete arrange vehicle record
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await ArrangeVehicle.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await ArrangeVehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
