const mongoose = require('mongoose');

const OrderInvoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryInfoToClient: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryInfoToClient' },
  priceInvoiceChecked: { type: String, enum: ['Yes', 'No'], required: true },
  freightInvoiceChecked: { type: String, enum: ['Yes', 'No'], required: true },
  quantityChecked: { type: String, enum: ['Yes', 'No'], required: true },
  needToHighlight: { type: String, enum: ['Yes', 'No'], required: true },
  remarks: { type: String },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrderInvoice', OrderInvoiceSchema);
