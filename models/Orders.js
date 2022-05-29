const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  qty: {
    type: String,
    required: true
  }
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;
