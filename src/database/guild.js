const mongoose = require('mongoose')

const guildConfigSchema = mongoose.Schema({
  guildId: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true
  },

  prefix: {
    type: mongoose.SchemaTypes.String,
    required: true,
    default: '!'
  },

  ticket: {
    type: mongoose.SchemaTypes.Number,
    default: 1
  },


})

module.exports = mongoose.model('guild', guildConfigSchema)


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/