const mongoose = require('mongoose');

const FeedbackCallSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderInvoice' },
  customerPickedCall: { type: String, enum: ['Picked', 'Not Picked', 'Branch', 'Cus Not Yet Received Stock'], required: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeedbackCall', FeedbackCallSchema);
