const Event = require('../structures/Event')
const Guild = require('../database/guild')

module.exports = class extends Event {
  async run () {
    console.log('Bot is ready !')
  }
}
