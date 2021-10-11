const Command = require('../../structures/Command')

module.exports = class extends Command {
  constructor (...args) {
    super(...args, {
      name: 'ping',
      aliases: ['ping', 'latency'],
      description: `Display\'s BOT\'s Ping Latency.`,
      category: 'Information',
      cooldown: 3
    })
  }

  async run (message) {
    const msg = await message.channel.send('Pinging...')
    const latency = msg.createdTimestamp - message.createdTimestamp

    msg.edit(
      ` \`\`\`js\nTime taken: ${latency}ms\nDiscord API: ${Math.round(
        this.client.ws.ping
      )}ms\`\`\``
    )
  }
}


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/