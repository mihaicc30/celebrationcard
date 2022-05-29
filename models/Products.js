const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  img: {
    type: String,
    default: "null"
  }
});

const Products = mongoose.model('Products', ProductsSchema);

module.exports = Products;
