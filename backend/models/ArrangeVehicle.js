const mongoose = require('mongoose');

const ArrangeVehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  finalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'FinalOrder', required: true },
  vehicleArrangementDetails: { type: String, required: true },
  vehicleType: { type: String, default: null },
  vehicleNumber: { type: String, default: null },
  driverName: { type: String, default: null },
  driverPhone: { type: String, default: null },
  deliveryType: { type: String, enum: ['Through LR for Outstation delivery', 'Local Vehicle for local delivery', 'Client Own Vehicle'], default: null },
  remark: { type: String, default: null },
  actualFreight: { type: Number, default: 0 },
  loadingAttachment: { type: String, default: null },
  challanAttachment: { type: String, default: null },
  loadingCompleted: { type: Boolean, default: false },
  loadingDate: { type: Date, default: null },
  billingSentToAccounts: { type: Boolean, default: false },
  accountsNotificationDate: { type: Date, default: null },
  billingRemarks: { type: String, default: null },
  status: { type: String, enum: ['Vehicle Arranged', 'Loading In Progress', 'Loading Completed', 'Accounts Notified'], default: 'Vehicle Arranged' },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ArrangeVehicle', ArrangeVehicleSchema);
