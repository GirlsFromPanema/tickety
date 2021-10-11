const Event = require('../../structures/Event')
const { Permissions, Collection } = require('discord.js')
const { MessageEmbed } = require('discord.js')
const Guild = require('../../database/guild')
const permissions = require('../../permissions.json')
const moment = require('moment')
require('moment-duration-format')
const config = require('../../../config.json')

module.exports = class extends Event {
  constructor (...args) {
    super(...args)

    this.impliedPermissions = new Permissions([
      'VIEW_CHANNEL',
      'SEND_MESSAGES',
      'SEND_TTS_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'MENTION_EVERYONE',
      'USE_EXTERNAL_EMOJIS',
      'ADD_REACTIONS'
    ])

    this.ratelimits = new Collection()
  }

  async run (message) {
    try {
      const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`)
      const mentionRegexPrefix = RegExp(`^<@!?${this.client.user.id}>`)

      if (!message.guild || message.author.bot) return

      const settings = await Guild.findOne(
        {
          guildId: message.guild.id
        },
        async (err, guild) => {
          if (err) console.log(err)

          if (!guild) {
            const newGuild = await Guild.create({
              guildId: message.guild.id,
              prefix: config.prefix || '!'
            })
          }
        }
      )

      if (message.content.match(mentionRegex)) {
        const embed = new MessageEmbed()
        embed.setColor('BLUE')
        embed.setTitle('BOT | Do you need help?')
        embed.setDescription(`My prefix here is:  ${config.prefix}`)
        embed.setFooter(
          message.author.tag,
          message.author.displayAvatarURL({ dynamic: true })
        )
        return message.channel.send(embed)
      }

      let mainPrefix = config.prefix

      const prefix = message.content.match(mentionRegexPrefix)
        ? message.content.match(mentionRegexPrefix)[0]
        : mainPrefix

      moment.suppressDeprecationWarnings = true

      if (!message.content.startsWith(prefix)) return

      // eslint-disable-next-line no-unused-vars
      const [cmd, ...args] = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g)
      const command =
        this.client.commands.get(cmd.toLowerCase()) ||
        this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()))

      if (command) {
        const rateLimit = this.ratelimit(message, cmd)

        if (
          !message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')
        )
          return

        if (typeof rateLimit === 'string') {
          const embed = new MessageEmbed()
            .setTitle('BOT | Cooldown')
            .setColor('BLUE')
            .setFooter(
              message.author.tag,
              message.author.displayAvatarURL({ dynamic: true })
            ).setDescription(`
              ${message.client.emoji.fail} please \`${rateLimit}\` ms cooldown. Try **${cmd}** later again!
            `)
          return message.channel.send(embed)
        }

        if (command.botPermission) {
          const missingPermissions = message.channel
            .permissionsFor(message.guild.me)
            .missing(command.botPermission)
            .map(p => permissions[p])

          if (missingPermissions.length !== 0) {
            const embed = new MessageEmbed()
              .setAuthor(
                `${this.client.user.tag}`,
                message.client.user.displayAvatarURL({ dynamic: true })
              )
              .setTitle(`${message.client.emoji.fail} Missing Bot Permissions`)
              .setDescription(
                `Command Name: **${
                  command.name
                }**\nRequired Permission: **${missingPermissions
                  .map(p => `${p}`)
                  .join(' - ')}**`
              )
              .setTimestamp()

              .setColor(message.guild.me.displayHexColor)
            return message.channel.send(embed).catch(() => {})
          }
        }

        if (command.userPermission) {
          const missingPermissions = message.channel
            .permissionsFor(message.author)
            .missing(command.userPermission)
            .map(p => permissions[p])
          if (missingPermissions.length !== 0) {
            const embed = new MessageEmbed()
              .setAuthor(
                `${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
              )
              .setTitle(`${message.client.emoji.fail} Missing User Permissions`)
              .setDescription(
                `Command Name: **${
                  command.name
                }**\nRequired Permission: **${missingPermissions
                  .map(p => `${p}`)
                  .join('\n')}**`
              )
              .setTimestamp()

              .setColor(message.guild.me.displayHexColor)
            return message.channel.send(embed).catch(() => {})
          }
        }

        if (command.adminOnly) {
          const embed = new MessageEmbed()
            .setTitle('BOT | Admin Only Command')
            .setDescription(
              `${message.client.emoji.fail} Hey. You are not allowed to run this Command`
            )
            .setFooter(
              message.author.tag,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setColor('RED')

          if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.channel.send(embed)
          }
        }

        if (command.disabled) return

        await this.runCommand(message, cmd, args).catch(error => {
          console.log(error)
          const embed = new MessageEmbed()
            .setTitle('BOT | Error')
            .setDescription(
              `An error occured in our System!\n\n\`Err-${makeid(
                10
              )}\``
            )
            .setFooter(
              message.author.tag,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setColor('RED')

          return message.channel.send(embed)
        })
      }
    } catch (error) {
      console.log(error)
      const embed = new MessageEmbed()
        .setTitle('BOT | Error')
        .setDescription(
          `An error occured in our System!\n\n\`Err-${makeid(
            10
          )}\``
        )
        .setFooter(
          message.author.tag,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setColor('RED')

      return message.channel.send(embed)
    }
  }

  async runCommand (message, cmd, args) {
    const command =
      this.client.commands.get(cmd.toLowerCase()) ||
      this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()))

    await command.run(message, args)
  }

  ratelimit (message, cmd) {
    try {
      const command =
        this.client.commands.get(cmd.toLowerCase()) ||
        this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()))
      if (message.author.permLevel > 4) return false

      const cooldown = command.cooldown * 1000
      const ratelimits = this.ratelimits.get(message.author.id) || {} // get the ENMAP first.
      if (!ratelimits[command.name])
        ratelimits[command.name] = Date.now() - cooldown // see if the command has been run before if not, add the ratelimit
      const difference = Date.now() - ratelimits[command.name] // easier to see the difference
      if (difference < cooldown) {
        // check the if the duration the command was run, is more than the cooldown
        return moment
          .duration(cooldown - difference)
          .format('D [days], H [hours], m [minutes], s [seconds]', 1) // returns a string to send to a channel
      } else {
        ratelimits[command.name] = Date.now() // set the key to now, to mark the start of the cooldown
        this.ratelimits.set(message.author.id, ratelimits) // set it
        return true
      }
    } catch (e) {
      console.log(e)
      const embed = new MessageEmbed()
        .setTitle('BOT | Error 404')
        .setDescription(
          `I did not found the right path\n\n\`Err-${makeid(
            10
          )}\``
        )
        .setFooter(
          message.author.tag,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setColor('RED')

      message.channel.send(embed)
    }
  }
}

function makeid (length) {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}


/*
(C) - Development

Interface/Structure/Setup:- Peterhanania
Translation, Fixes, General: Konrad570


*/