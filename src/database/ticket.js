const mongoose = require('mongoose')

const ticketSchema = mongoose.Schema({
  channel: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true
  },

  number: {
    type: mongoose.SchemaTypes.Number,
    required: true,
    unique: true
  },

  date: {
    type: mongoose.SchemaTypes.Number,
    default: Date.now()
  },

  ticketclosed: { type: Boolean, default: false },

  closed: {
    date: Number,
    by: Array
  },

  transcript: {
    type: mongoose.SchemaTypes.Array,
    default: []
  },

  owner: { type: String }
})

module.exports = mongoose.model('ticket', ticketSchema)


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/