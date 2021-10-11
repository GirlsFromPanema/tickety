const { Client, Collection } = require('discord.js')
const Util = require('./structures/Util')
const config = require('../config.json');
const mongoose = require('mongoose')

module.exports = class botClient extends Client {
  constructor (options = {}) {
    super({
      partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
      cacheGuilds: true,
      cacheChannels: true,
      cacheOverwrites: false,
      cacheRoles: true,
      cacheEmojis: true,
      cachePresences: true,
      fetchAllMembers: true,
      disableMentions: 'everyone',
      messageCacheMaxSize: 25,
      messageCacheLifetime: 10000,
      messageSweepInterval: 12000,
      ws: {
        intents: [
          'GUILDS',
          'GUILD_MEMBERS',
          'GUILD_MESSAGES',
          'GUILD_EMOJIS',
          'GUILD_MESSAGE_REACTIONS'
        ]
      }
    })

    this.commands = new Collection()
    this.events = new Collection()
    this.aliases = new Collection()
    this.utils = new Util(this)
  }

  async start (token = this.token) {
    const connect = {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }

    await mongoose.connect(config.mongodb_url, connect)

    this.utils.loadCommands()
    this.utils.loadEvents()

    require('./api/api')

    this.login(config.token)
  }
}


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/