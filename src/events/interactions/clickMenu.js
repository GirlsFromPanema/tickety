const Event = require('../../structures/Event')
const Discord = require('discord.js')
const Ticket = require('../../database/ticket')
const Guild = require('../../database/guild')
const { MessageButton, MessageActionRow } = require('discord-buttons')
const config = require('../../../config.json')

module.exports = class extends Event {
  async run (menu) {
    const number = parseInt(menu.values[0])
    const member = menu.clicker.member
    let guildDB = await Guild.findOne({ guildId: menu.guild.id })
    if (!guildDB) {
      await Guild.create({
        guildId: menu.guild.id,
        prefix: config.prefix
      })
      guildDB = await Guild.findOne({ guildId: menu.guild.id })
    }

    const numbers = ['1', '2', '3']

    if (numbers.includes(number.toString())) {
      await Ticket.findOne(
        { owner: member.id, ticketclosed: false },
        async (err, data) => {
          if (data) {
            const channel = await menu.guild.channels.cache.get(data.channel)
            if (channel) {
              const embed = new Discord.MessageEmbed()
                .setTitle('BOT | Limit for Support Requests reached')
                .setColor('RED')
                .setDescription(
                  `${this.client.emoji.fail} You already have an active Support Request <#${data.channel}>`
                )
                .setFooter(
                  member.user.tag,
                  member.user.displayAvatarURL({ dynamic: true })
                )
              await menu.reply.send('You already have an active Support Request', true)

              return member.send(embed).catch(() => {})
            }
            if (!channel && data) await data.deleteOne()
          }

          const ticketNumber =
            guildDB && guildDB.ticket ? guildDB.ticket + 1 : 1

          if (number === 1) {
            let permissions = [
              {
                id: member.id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              },
              {
                id: menu.guild.roles.everyone,
                deny: ['VIEW_CHANNEL']
              }
            ]
            for (let id of config.ticket.options.option1.ticket.support) {
              const newPermission = {
                id: id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              }
              permissions.push(newPermission)
            }

            let channel = await menu.guild.channels.create(
              `Ticket-${ticketNumber}`,
              {
                type: 'text',
                topic: `TICKET #${ticketNumber} | USER: ${member.user.tag} (${
                  member.user.id
                }) | ${new Date(Date.now()).toDateString()}`,
                parent: config.ticket.options.option1.ticket.parent,
                permissionOverwrites: permissions
              }
            )

            await Ticket.create({
              channel: channel.id,
              number: ticketNumber,
              date: Date.now(),
              owner: member.id
            })

            if (config.ticket.options.option1.ticket.message.image) {
              await channel.send(
                config.ticket.options.option1.ticket.message.image
              )
            }

            let supportEmbed = new Discord.MessageEmbed()
              .setColor('GREEN')
              .setDescription(
                config.ticket.options.option1.ticket.message.content
              )

            let supportButton = new MessageButton()
              .setLabel('🔒 Close Support Request')
              .setStyle('red')
              .setID(`ticket_close_${channel.id}`)

            channel.send(`${member} here is your Support Request!`, {
              embed: supportEmbed,
              component: new MessageActionRow().addComponent(supportButton)
            })
          } else if (number === 2) {
            let permissions = [
              {
                id: member.id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              },
              {
                id: menu.guild.roles.everyone,
                deny: ['VIEW_CHANNEL']
              }
            ]
            for (let id of config.ticket.options.option2.ticket.support) {
              const newPermission = {
                id: id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              }
              permissions.push(newPermission)
            }

            let channel = await menu.guild.channels.create(
              `Ticket-${ticketNumber}`,
              {
                type: 'text',
                topic: `TICKET #${ticketNumber} | USER: ${member.user.tag} (${
                  member.user.id
                }) | ${new Date(Date.now()).toDateString()}`,
                parent: config.ticket.options.option2.ticket.parent,
                permissionOverwrites: permissions
              }
            )

            await Ticket.create({
              channel: channel.id,
              number: ticketNumber,
              date: Date.now(),
              owner: member.id
            })

            if (config.ticket.options.option2.ticket.message.image) {
              await channel.send(
                config.ticket.options.option2.ticket.message.image
              )
            }

            let supportEmbed = new Discord.MessageEmbed()
              .setColor('GREEN')
              .setDescription(
                config.ticket.options.option2.ticket.message.content
              )

            let supportButton = new MessageButton()
              .setLabel('🔒 Close Support Ticket')
              .setStyle('red')
              .setID(`ticket_close_${channel.id}`)

            channel.send(`${member} here is your Support Request`, {
              embed: supportEmbed,
              component: new MessageActionRow().addComponent(supportButton)
            })
          } else if (number === 3) {
            let permissions = [
              {
                id: member.id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              },
              {
                id: menu.guild.roles.everyone,
                deny: ['VIEW_CHANNEL']
              }
            ]
            for (let id of config.ticket.options.option3.ticket.support) {
              const newPermission = {
                id: id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              }
              permissions.push(newPermission)
            }

            let channel = await menu.guild.channels.create(
              `Ticket-${ticketNumber}`,
              {
                type: 'text',
                topic: `TICKET #${ticketNumber} | USER: ${member.user.tag} (${
                  member.user.id
                }) | ${new Date(Date.now()).toDateString()}`,
                parent: config.ticket.options.option3.ticket.parent,
                permissionOverwrites: permissions
              }
            )

            await Ticket.create({
              channel: channel.id,
              number: ticketNumber,
              date: Date.now(),
              owner: member.id
            })

            if (config.ticket.options.option3.ticket.message.image) {
              await channel.send(
                config.ticket.options.option3.ticket.message.image
              )
            }

            let supportEmbed = new Discord.MessageEmbed()
              .setColor('GREEN')
              .setDescription(
                config.ticket.options.option3.ticket.message.content
              )

            let supportButton = new MessageButton()
              .setLabel('🔒 Close Support Ticket')
              .setStyle('red')
              .setID(`ticket_close_${channel.id}`)

            channel.send(`${member} here is your Support Ticket!`, {
              embed: supportEmbed,
              component: new MessageActionRow().addComponent(supportButton)
            })
          }

          guildDB.ticket++
          await guildDB.save()

          try {
            if (menu)
              await menu.reply.send('Your ticket has been created!', true)
          } catch (err) {}
        }
      )
    }
  }
}


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/