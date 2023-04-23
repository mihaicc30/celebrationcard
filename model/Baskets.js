const mongoose = require('mongoose');

const BasketsSchema = new mongoose.Schema({
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

const Baskets = mongoose.model('Baskets', BasketsSchema);

module.exports = Baskets;
