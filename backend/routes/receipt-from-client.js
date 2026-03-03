const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ReceiptFromClient = require('../models/ReceiptFromClient');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'receipt-from-client');
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

// POST: create new receipt from client record
router.post('/', auth, upload.single('receiptFile'), async (req, res) => {
  try {
    const { orderId, billingEwayId } = req.body;
    let { clientType } = req.body;
    console.log('ReceiptFromClient POST raw body:', req.body);
    // Normalize clientType to expected enum values
    const normalizeClientType = (val) => {
      if (val === undefined || val === null) return null;
      const s = String(val).trim().toLowerCase();
      if (s === 'local' || s === 'l') return 'Local';
      if (s === 'outstation' || s === 'out' || s === 'o') return 'Outstation';
      // Legacy or unexpected values that map to Local/Outstation
      if (s === 'individual' || s === 'ind') return 'Local';
      if (s === 'corporate' || s === 'corp') return 'Outstation';
      return null; // unknown
    };

    clientType = normalizeClientType(clientType);
    if (!clientType) {
      return res.status(400).json({ message: 'Client Type is required and must be Local or Outstation' });
    }

    const data = {
      user: req.user.id,
      billingEway: billingEwayId || null,
      clientType,
      // store web‑friendly path (always forward slashes)
      receiptFile: req.file ? path.join('uploads', 'receipt-from-client', req.file.filename).replace(/\\/g, '/') : null
    };

    const rfc = new ReceiptFromClient(data);
    await rfc.save();
    
    if (orderId) {
      const Order = require('../models/Order');
      await Order.findByIdAndUpdate(orderId, { receiptFromClient: rfc._id });
    }
    
    const saved = await ReceiptFromClient.findById(rfc._id);
    res.json(saved);
  } catch (err) {
    console.error('ReceiptFromClient Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET: list user's receipt records
router.get('/', auth, async (req, res) => {
  try {
    const records = await ReceiptFromClient.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: single record
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await ReceiptFromClient.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
