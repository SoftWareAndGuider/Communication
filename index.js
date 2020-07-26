const PORT = process.env.janggok || 8080

const express = require('express')
const path = require('path').resolve()
const { renderFile: render } = require('ejs')
const { food } = require('./crawler')
const app = express()

app.get('/', (req, res) => {
  const userAgent = req.header('User-Agent') || ''
  if (userAgent.includes('Mobi')) return res.redirect('/m/')
  
  const date = new Date()
  food(date.getFullYear(), date.getMonth() + 1, date.getDate() - 1, (err, foodData) => {
    if (err) console.log(err)
    render(path + '/page/index.ejs', { foodData: foodData.result }, (err, str) => {
      if (err) console.log(err)
      else res.send(str)
    })
  })
})

app.get('/m/', (_, res) => {
  render(path + '/page/mobile.ejs', {  }, (err, str) => {
    if (err) console.log(err)
    else res.send(str)
  })
})

app.use(express.static(path + '/public'))
app.use('/src', express.static(path + '/src/'))

app.listen(PORT, () => console.log('Janggok Communication is now online at http://localhost:' + PORT))
