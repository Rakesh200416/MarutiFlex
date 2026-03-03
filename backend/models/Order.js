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
  // Stage references
  financialCreditibility: { type: mongoose.Schema.Types.ObjectId, ref: 'FinancialCreditibility', default: null },
  managementApproval: { type: mongoose.Schema.Types.ObjectId, ref: 'ManagementApproval', default: null },
  finalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'FinalOrder', default: null },
  arrangeVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'ArrangeVehicle', default: null },
  billing: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingEway', default: null },
  receiptFromClient: { type: mongoose.Schema.Types.ObjectId, ref: 'ReceiptFromClient', default: null },
  statusOfMaterial: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusOfMaterial', default: null },
  orderInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderInvoice', default: null },
  deliveryInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryInfoToClient', default: null },
  feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackCall', default: null },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
