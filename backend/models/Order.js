const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  godownLocation: String,
  partyName: String,
  contactPerson: String,
  contactNumber: String,
  areaOfDelivery: String,
  placeCity: String,
  salesExecutive: String,
  orderTakenBy: String,
  crmTransporter: String,
  freightPaidBy: String,
  freightAmount: Number,
  deliveryType: String,
  approxOrderValue: Number,
  orderDescription: String,
  orderRemarks: String,
  expectedDate: Date,
  paymentDescription: String,
  productNotAvailable: Boolean,
  items: [String],
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
