const mongoose = require('mongoose');

const DeliveryInfoToClientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  statusOfMaterial: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusOfMaterial' },
  informedAboutDelay: { type: String, enum: ['Yes', 'No'], required: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeliveryInfoToClient', DeliveryInfoToClientSchema);
