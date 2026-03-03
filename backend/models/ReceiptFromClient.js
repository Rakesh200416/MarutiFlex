const mongoose = require('mongoose');

const ReceiptFromClientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billingEway: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingEway' },
  receiptFile: { type: String }, // file path
  clientType: { type: String, enum: ['Local', 'Outstation'], required: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReceiptFromClient', ReceiptFromClientSchema);
