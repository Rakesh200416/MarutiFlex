const mongoose = require('mongoose');

const StatusOfMaterialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiptFromClient: { type: mongoose.Schema.Types.ObjectId, ref: 'ReceiptFromClient' },
  materialReachedOnTime: { type: String, enum: ['On Time', 'Delay'], required: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StatusOfMaterial', StatusOfMaterialSchema);
