const mongoose = require('mongoose');

const ShippingSchema = new mongoose.Schema({
  ship: {
    type: String,
    required: true
  }
});

const Shipping = mongoose.model('Shipping', ShippingSchema);

module.exports = Shipping;
