const mongoose = require('mongoose');

const ManagementApprovalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  financialCreditibility: { type: mongoose.Schema.Types.ObjectId, ref: 'FinancialCreditibility', required: true },
  approvalStatus: { type: String, enum: ['Approved', 'Rejected', 'Hold By Management'], required: true },
  remarks: { type: String, required: true },
  approvedBy: { type: String, default: null },
  approvalDate: { type: Date, default: Date.now },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ManagementApproval', ManagementApprovalSchema);
