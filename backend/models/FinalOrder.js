const mongoose = require('mongoose');

const FinalOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  financialCreditibility: { type: mongoose.Schema.Types.ObjectId, ref: 'FinancialCreditibility', required: true },
  managementApproval: { type: mongoose.Schema.Types.ObjectId, ref: 'ManagementApproval', required: false, default: null },
  orderStatus: { type: String, enum: ['Proceed', 'Support'], required: true },
  cancelledReason: { 
    type: String, 
    required: false,
    default: null
  },
  otherReason: { type: String, required: false, default: null },
  finalOrder: { type: String, required: true },
  partDelivery: { type: String, enum: ['Yes', 'No'], required: true },
  managementApprovalScreenshot: { type: String, required: false, default: null },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FinalOrder', FinalOrderSchema);
