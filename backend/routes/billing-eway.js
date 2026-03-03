const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BillingEway = require('../models/BillingEway');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'billing-eway');
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

// create new billing eway record (multipart for file)
router.post('/', auth, upload.single('tallyInvoiceCopy'), async (req, res) => {
  try {
    const { orderId, finalOrderId } = req.body;
    let { eWayBill, invoiceNo, invoiceValue, eInvoiceGenerated } = req.body;
    console.log('BillingEway POST raw body:', req.body);
    console.log('BillingEway file:', req.file);

    // Helper to normalize incoming yes/no-like values to 'Yes' or 'No'
    const normalizeYesNo = (val) => {
      if (val === undefined || val === null) return null;
      const s = String(val).trim().toLowerCase();
      if (s === 'yes' || s === 'y' || s === 'true' || s === '1') return 'Yes';
      if (s === 'no' || s === 'n' || s === 'false' || s === '0') return 'No';
      // Fallback: treat any non-empty truthy string starting with 'y' as yes
      if (s.length && s[0] === 'y') return 'Yes';
      return 'No';
    };

    eWayBill = normalizeYesNo(eWayBill);
    eInvoiceGenerated = normalizeYesNo(eInvoiceGenerated);

    const missing = [];
    if (!eWayBill) missing.push('eWayBill');
    if (!invoiceNo) missing.push('invoiceNo');
    if (!invoiceValue) missing.push('invoiceValue');
    if (!eInvoiceGenerated) missing.push('eInvoiceGenerated');
    if (missing.length) {
      console.warn('BillingEway validation failed, missing:', missing);
      return res.status(400).json({ message: 'All required fields must be provided', missing });
    }

    const data = {
      user: req.user.id,
      finalOrder: finalOrderId || null,
      eWayBill,
      invoiceNo: String(invoiceNo).trim(),
      invoiceValue: String(invoiceValue).trim(),
      eInvoiceGenerated,
      tallyInvoiceCopy: req.file ? path.join('uploads', 'billing-eway', req.file.filename).replace(/\\/g, '/') : null
    };

    const be = new BillingEway(data);
      console.log('Creating BillingEway record with data:', data);
    await be.save();
      console.log('BillingEway saved successfully:', be._id);
    
    if (orderId) {
      const Order = require('../models/Order');
      await Order.findByIdAndUpdate(orderId, { billing: be._id });
    }
    
    const saved = await BillingEway.findById(be._id);
    res.json(saved);
  } catch (err) {
    console.error('BillingEway Error:', err.message);
    console.error('Full error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message, details: err.errors ? Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`) : null });
  }
});

// list user's billing records
router.get('/', auth, async (req, res) => {
  try {
    const records = await BillingEway.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get single
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await BillingEway.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
