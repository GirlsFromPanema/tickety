let express = require('express')
let app = express()
const port = require('../../config.json').port || 5000
const Ticket = require('../database/ticket')

app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
  let ticket = req.query
  if (ticket['ticket']) {
    ticket = ticket['ticket']

    if (typeof ticket === 'array') {
      ticket = ticket[0]
    } else if (typeof ticket === 'string') {
      ticket = ticket
    } else
      return res.json({ error: true, message: 'ERROR | Invalid Transcript' })

    await Ticket.findOne({ _id: ticket }, async (err, data) => {
      if (err) {
        return res.json({ error: true, message: 'ERROR | Invalid Ticket' })
      }

      if (data) {
        if (data.transcript && data.transcript[0].content.message.length > 0) {
          res.render('transcript.ejs', {
            ticket: ticket,
            data: data
          })
        } else {
          res.json({ error: true, message: 'ERROR | This transcript is empty' })
        }
      } else {
        return res.json({ error: true, message: 'ERROR | Invalid Ticket' })
      }
    })
  } else
    return res.json({ error: true, message: 'ERROR | Invalid Transcript' })
})

app.listen(port, () => console.log('Website online at: ' + port))
