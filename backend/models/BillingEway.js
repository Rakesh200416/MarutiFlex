const mongoose = require('mongoose');

const BillingEwaySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  finalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'FinalOrder', default: null },
  tallyInvoiceCopy: { type: String, default: null },
  eWayBill: { type: String, enum: ['Yes', 'No'], required: true },
  invoiceNo: { type: String, required: true },
  invoiceValue: { type: String, required: true },
  eInvoiceGenerated: { type: String, enum: ['Yes', 'No'], required: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BillingEway', BillingEwaySchema);
