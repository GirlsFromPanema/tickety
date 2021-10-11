const Command = require('../../structures/Command')
const { MessageEmbed } = require('discord.js')
const {
  MessageMenuOption,
  MessageMenu,
  MessageActionRow
} = require('discord-buttons')
const config = require('../../../config.json')

module.exports = class extends Command {
  constructor (...args) {
    super(...args, {
      name: 'createticket',
      aliases: ['ct'],
      description: `Eval`,
      category: 'Owner',
      adminOnly: true
    })
  }

  async run (message, args) {
    const options = config.ticket.options

    let select1
    let select2
    let select3

    const OMG = new MessageMenu()
      .setID(`placeholder`)
      .setPlaceholder(
        options.label ? options.label : ` ✅ | Ticketing`
      )

    if (options.option1) {
      select1 = new MessageMenuOption()
        .setLabel(options.option1.label)
        .setDescription(options.option1.description)
        .setEmoji(options.option1.emoji)
        .setValue(`1`)

      OMG.addOption(select1)
    }

    if (options.option2) {
      select2 = new MessageMenuOption()
        .setLabel(options.option2.label)
        .setDescription(options.option2.description)
        .setEmoji(options.option2.emoji)
        .setValue(`2`)

      OMG.addOption(select2)
    }

    if (options.option3) {
      select3 = new MessageMenuOption()
        .setLabel(options.option3.label)
        .setDescription(options.option3.description)
        .setEmoji(options.option3.emoji)
        .setValue(`3`)

      OMG.addOption(select3)
    }

    const row = new MessageActionRow().addComponent(OMG)

    const embed = new MessageEmbed()
      .setTitle(
        options.embed.title ? options.embed.title : 'BOT | OneUpGaming'
      )
      .setDescription(
        options.embed.description
          ? options.embed.description
          : `Welcome to the OneUpGaming Support Panel, select your option below.`
      )
      .setColor(message.guild.me.displayHexColor)

    await message.channel.send(embed, {
      components: [row]
    })
  }
}


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/