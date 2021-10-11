const botclient = require('./bot')
const config = require('../config.json')

// define the client
const bot = new botclient(config)

// load colors
bot.color = require('./colors.js')

//load emojis
bot.emoji = require('./emojis.js')

//Map needed for reaction roles
bot.react = new Map()

require('discord-buttons')(bot)

//start the bot
bot.start()

/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/