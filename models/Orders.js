const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
  userTOTAL: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  userNAME: {
    type: String,
    required: true
  },
  userEMAIL: {
    type: String,
    required: true
  },
  userADDRESS: {
    type: String,
    required: true
  },
  userORDER: {
    type: Object,
    required: true
  },
  userMESSAGE: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  },
  adminSEEN: {
    type: String,
    default: "1"
  }
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;
