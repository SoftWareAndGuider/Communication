const PORT = process.env.janggok || 8080

const express = require('express')
const path = require('path').resolve()
const { renderFile: render } = require('ejs')
const { food } = require('./crawler')
const knex = require('knex')
const app = express()

const db = knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'janggokComu',
    database: 'janggokComu'
  }
})

app.get('/', (_, res) => {
  const date = new Date()

  // Crawl Part ---
  food(date.getFullYear(), date.getMonth() + 1, date.getDate(), async (err, foodData) => {
    if (err) console.log(err)

    // SQL Part ---
    const bd_noti = await db.select('title', 'id').from('bd_noti').limit(5).orderBy('id', 'desc')

    // Render Part ---
    render(path + '/page/index.ejs', { foodData: foodData.result, bd_noti }, (err, str) => {
      if (err) console.log(err)
      else res.send(str)
    })
  })
})

app.get('/board/noti', async (req, res) => {
  const bd_noti = await db.select('*').from('bd_noti').leftJoin('users', 'bd_noti.author', 'users.id').limit(10).offset(req.query.page * 10 || 0).orderBy('bd_noti.id', 'desc')
  render(path + '/page/list.ejs', { bname: '공지 게시판', bd_noti, offset: req.query.page || 0 }, (err, str) => {
    if (err) console.log(err)
    res.send(str)
  })
})

app.get('/board/noti/:id', async (req, res) => {
  const [ content ] = await db.select('*').from('bd_noti').where('bd_noti.id', req.params.id).leftJoin('users', 'bd_noti.author', 'users.id')
  render(path + '/page/board.ejs', { content, xss: true }, (err, str) => {
    if (err) console.log(err)
    res.send(str)
  })
})

app.use(express.static(path + '/public'))
app.use('/src', express.static(path + '/src/'))

app.listen(PORT, () => console.log('Janggok Communication is now online at http://localhost:' + PORT))
