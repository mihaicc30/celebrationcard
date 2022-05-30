const mongoose = require('mongoose');

const ContactsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  adminSEEN: {
    type: String,
    default: "1"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Contacts = mongoose.model('Contacts', ContactsSchema);

module.exports = Contacts;
