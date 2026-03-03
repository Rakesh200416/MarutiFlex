const mongoose = require('mongoose');

const FinancialCreditibilitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overdueOfParty: { type: String, enum: ['Yes', 'No'], required: true },
  creditLimitIfAccess: { type: String, enum: ['Yes', 'No'], required: true },
  informationToCRM: { type: String, enum: ['Yes', 'No'], required: true },
  whetherOrderProcessed: { type: String, enum: ['Yes', 'No'], required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  approvedBy: { type: String, default: null },
  approvalDate: { type: Date, default: null },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FinancialCreditibility', FinancialCreditibilitySchema);
