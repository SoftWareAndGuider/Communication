const PORT = process.env.janggok || 8080

const express = require('express')
const path = require('path').resolve()
const { renderFile: render } = require('ejs')

const cooldown = []
const { food } = require('./utils/crawler')
const getLayout = require('./utils/getLayout')

const knex = require('knex')
const app = express()
let layouts

getLayout((data) => {
  layouts = data
})

const db = knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'janggokComu',
    database: 'janggokComu'
  }
})

app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => {
  const date = new Date()

  // Crawl Part ---
  food(date.getFullYear(), date.getMonth() + 1, date.getDate(), async (err, foodData) => {
    if (err) console.log(err)

    // SQL Part ---
    const bd_noti = await db.select('title', 'id').from('bd_noti').limit(5).orderBy('id', 'desc')

    // Render Part ---
    render(path + '/page/index.ejs', { foodData: foodData.result, bd_noti, layouts }, (err, str) => {
      if (err) console.log(err)
      else res.send(str)
    })
  })
})

app.get('/board/noti', async (req, res) => {
  const bd_noti = await db.select('*').from('bd_noti').leftJoin('users', 'bd_noti.author', 'users.id').orderBy('bd_noti.id', 'desc')
  render(path + '/page/list.ejs', { bname: '공지 게시판', board: bd_noti, bslot: 'noti', offset: req.query.page || 0, layouts }, (err, str) => {
    if (err) console.log(err)
    res.send(str)
  })
})

app.get('/board/noti/write', (req, res) => {
  res.status(403).send('쓰기 권한 없음')
})

app.get('/board/noti/:id', async (req, res) => {
  const [ content ] = await db.select('*').from('bd_noti').where('bd_noti.id', req.params.id).leftJoin('users', 'bd_noti.author', 'users.id')
  render(path + '/page/board.ejs', { content, xss: true, layouts }, (err, str) => {
    if (err) console.log(err)
    res.send(str)
  })
})


app.get('/board/suggest', async (req, res) => {
  const bd_suggest = await db.select('*').from('bd_suggest').leftJoin('users', 'bd_suggest.author', 'users.id').orderBy('bd_suggest.id', 'desc')
  render(path + '/page/list.ejs', { bname: '문의 게시판', board: bd_suggest, bslot: 'suggest', offset: req.query.page || 0, layouts }, (err, str) => {
    if (err) console.log(err)
    res.send(str)
  })
})

app.get('/board/suggest/write', (_, res) => {
  render(path + '/page/write.ejs', { bname: '문의 게시판', bslot: 'suggest', layouts }, (err, str) => {
    if (err) console.log(err)
    res.send(str)
  })
})

app.post('/board/suggest/write', async (req, res) => {
  if (cooldown.includes(req.ip)) return res.send('<script>alert(\'베타 기간중에는 30초 글 올리기 제한이 있습니다\');window.location.replace(\'/\')</script>')
  const coolindex = cooldown.push(req.ip)
  setTimeout(() => {
    cooldown.splice(coolindex)
  }, 30000)
  
  if (!req.body.title || !req.body.content || !req.body) return res.send('<script>alert(\'잘못된 요청입니다\');window.location.replace(\'/\')</script>')
  if (req.body.content.length < 10) return res.send('<script>alert(\'글이 너무 짧아 올릴 수 없습니다\');window.location.replace(\'/\')</script>')

  const id = Date.now()
  await db.insert({ id, title: req.body.title, content: req.body.content, author: 0 })
  res.send('<script>alert(\'게시글이 성공적으로 등록되었습니다\');window.location.replace(\'/board/suggest/' + id + '\')</script>')
})

app.get('/board/suggest/:id', async (req, res) => {
  const [ content ] = await db.select('*').from('bd_suggest').where('bd_suggest.id', req.params.id).leftJoin('users', 'bd_suggest.author', 'users.id')
  render(path + '/page/board.ejs', { content, xss: false, layouts }, (err, str) => {
    if (err) console.log(err)
    res.send(str)
  })
})

app.use(express.static(path + '/public'))
app.use('/src', express.static(path + '/src/'))
app.use('/node_modules', express.static(path + '/node_modules'))

app.listen(PORT, () => console.log('Janggok Communication is now online at http://localhost:' + PORT))
