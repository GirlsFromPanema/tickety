const Event = require('../../structures/Event')
const Discord = require('discord.js')
const { MessageAttachment } = require('discord.js')
const Ticket = require('../../database/ticket')
const Guild = require('../../database/guild')
const { MessageButton, MessageActionRow } = require('discord-buttons')
const config = require('../../../config.json')
module.exports = class extends Event {
  async run (button) {
    const member = button.clicker.member

    if (button.id == `ticket_close_${button.channel.id}`) {
      let yes = new MessageButton()
        .setLabel('✅ Close')
        .setStyle('green')
        .setID(`ticket_close_yes_${button.channel.id}`)
      let no = new MessageButton()
        .setLabel('❌ Cancel')
        .setStyle('red')
        .setID(`ticket_close_no_${button.channel.id}`)

      let msg = await button.channel.send(
        `${member}, Would you like to send this Help Request?`,
        {
          components: new MessageActionRow().addComponent(yes).addComponent(no)
        }
      )
      let filter = member => member.id === member.id
      let collector = msg.createButtonCollector(filter, {
        max: 1,
        time: 60000,
        errors: ['time']
      })

      collector.on('collect', async button => {
        if (button.id == `ticket_close_yes_${button.channel.id}`) {
          await Ticket.findOne(
            { channel: button.channel.id },
            async (err, data) => {
              if (data) {
                data.ticketclosed = true
                data.closed.date = Date.now()

                const userObject = {
                  id: member.id,
                  tag: member.user.tag,
                  avatar: member.user.displayAvatarURL({ dynamic: true }),
                  bot: member.bot ? true : false
                }

                data.closed.by.push(userObject)

                const newData = await data.save({ new: true })
              }

              let closedEmbed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('BOT | Moderator Settings')
                .setDescription(
                  `Ticket closed by ${button.clicker.user}\n🔓 Re-open\n📛 Decline Request\n💫 Fetch- Copy Request`
                )

              let reopen = new MessageButton()
                .setLabel('')
                .setID(`ticket_reopen_${data.channel}`)
                .setEmoji('🔓')
                .setStyle('green')

              let deleteButton = new MessageButton()
                .setLabel('')
                .setID(`ticket_delete_${data.channel}`)
                .setEmoji('📛')
                .setStyle('red')

              let transcriptButton = new MessageButton()
                .setLabel('')
                .setID(`ticket_transcript_${data.channel}`)
                .setEmoji('💫')
                .setStyle('blurple')

              button.channel.edit({
                name: `closed-${data.number}`,
                topic: `Closed by ${button.clicker.user}`,
                parent: config.closed_parent_id,
                permissionOverwrites: [
                  {
                    id: button.guild.roles.everyone,
                    deny: ['VIEW_CHANNEL']
                  },
                  {
                    id: member.id,
                    deny: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                  }
                ]
              })

              button.channel.send(closedEmbed, {
                components: new MessageActionRow()
                  .addComponent(reopen)
                  .addComponent(deleteButton)
                  .addComponent(transcriptButton)
              })
            }
          )
        } else if (button.id == `ticket_close_no_${button.channel.id}`) {
          await collector.stop()
          button.channel.send(`${this.client.emoji.fail} | Cancelled`)
        }
      })
    } else if (button.id == `ticket_delete_${button.channel.id}`) {
      await Ticket.findOne(
        { channel: button.channel.id },
        async (err, data) => {
          if (data) {
            let ticketChannel = button.channel

            let allMessages = await ticketChannel.messages.fetch()
            let ticketContent = allMessages.filter(
              m =>
                m.content && m.author.id != this.client.user.id && !m.author.bot
            )

            const transcript = {
              id: data.channel,
              number: data.number,
              date: Date.now(),
              by: {
                id: button.clicker.user.id,
                tag: button.clicker.user.tag,
                avatar: button.clicker.user.displayAvatarURL({ dynamic: true }),
                bot: button.clicker.user.bot ? true : false
              },
              content: {
                user: ticketContent.map(m =>
                  m.author.displayAvatarURL({ dynamic: true })
                ),
                message: ticketContent.map(
                  m =>
                    msToTime(m.createdTimestamp) +
                    ' | ' +
                    m.author.tag +
                    ': ' +
                    m.content
                )
              }
            }

            data.transcript.push(transcript)
            await data.save()

            button.guild.channels.cache
              .get(config.transcript_channel_id)
              .send(
                `${button.clicker.user}, #${button.channel.name} \`(${
                  button.channel.id
                })\` ${config.domain}/?ticket=${data._id.toString()}`
              )
            ticketChannel.delete()
            return
          }
        }
      )
    } else if (button.id == `ticket_reopen_${button.channel.id}`) {
      await Ticket.findOne(
        { channel: button.channel.id },
        async (err, data) => {
          if (data) {
            data.ticketclosed = false
            data.closed.date = null

            data.closed.by = []

            await data.save({ new: true })

            button.channel.edit({
              name: `ticket-${data.number}`,
              topic: `Re- open Ticket #${data.number} | USER: ${
                member.user.tag
              } (${member.user.id}) | ${new Date(Date.now()).toDateString()}`,
              parent: config.parent_id,
              permissionOverwrites: [
                {
                  id: button.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL']
                },
                {
                  id: data.owner,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                }
              ]
            })
            let supportButton = new MessageButton()
              .setLabel('🔒 Close Help Request')
              .setStyle('red')
              .setID(`ticket_close_${button.channel.id}`)

            button.guild.channels.cache
              .get(config.transcript_channel_id)
              .send(
                `${button.clicker.user}, #${data.number} Open Help Request ID: \`(${data.channel})\``
              )

            button.channel.send(
              `<@${data.owner}> Your request got answered`,
              {
                component: new MessageActionRow().addComponent(supportButton)
              }
            )
          }
        }
      )
    } else if (button.id == `ticket_transcript_${button.channel.id}`) {
      let ticketChannel = button.channel

      let allMessages = await ticketChannel.messages.fetch()
      let systemMessages = allMessages
        .filter(
          m => m.content && m.author.id != this.client.user.id && !m.author.bot
        )
        .map(
          m =>
            msToTime(m.createdTimestamp) +
            ' | ' +
            m.author.tag +
            ': ' +
            m.content
        )
        .join('\n')

      let trans = new MessageAttachment(
        Buffer.from(systemMessages),
        `transcript_${button.channel.id}.txt`
      )

      button.guild.channels.cache
        .get(config.transcript_channel_id)
        .send(`${button.clicker.user} Received Request`, {
          files: [trans]
        })
    }

    await button.reply.defer()
  }
}
function msToTime (ms) {
  let fullFill = (a, limit) =>
    ('0'.repeat(69) + a.toString()).slice(limit ? -limit : -2)

  let daet = new Date(ms)

  let day = fullFill(daet.getDate())
  let month = fullFill(daet.getMonth())
  let year = fullFill(daet.getFullYear(), 4)

  let hours = fullFill(daet.getHours())
  let mins = fullFill(daet.getMinutes())
  let secs = fullFill(daet.getSeconds())

  return `${day}/${month}/${year} ${hours}:${mins}:${secs}`
}


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/