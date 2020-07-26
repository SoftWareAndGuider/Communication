const { get } = require('superagent')
const { load } = require('cheerio')

function food (year, month, date, cb) {
  const obj = { query: { year, month, date }, result: {} }
  get('http://school.gyo6.net/janggok/food/' + [year, month, date].join('/') + '/lunch', (err, sres) => {
    if (err) {
      cb(err)
    } else {
      const $ = load(sres.text)

      /*
        Rules of http://school.gyo6.net/janggok/food/.. (Discoverd by SWAG Team)
        There is a Table that has data of lunch
        location: html>body>form>div.tableTy2>table
        Content of 1st <td>: Year, Month, Date of Query
        Content of 2nd <td>: Total kcal of lunch menu, Syntax: nKcal
        Content of 3rd <td>: <div> tag that has menu split by <br>
        Content of 4th <td>: <div> tag that has wonsanzi of lunch menu split by <br>
        Content of 5th <td>: <a> tag that has <img> of lunch menu
      */
      const kcal = parseFloat($('td')[1].children[0].data.normalize().replace('Kcal', ''))
      const menu = []
      $('td')[2].children[1].children.forEach((e, i) => {
        if (e.type === 'text') {
          menu[menu.length] = e.data.normalize()
        }
      })

      const wonsanzi = {}
      $('td')[3].children[1].children.forEach((e, i) => {
        if (e.type === 'text') {
          const arr = e.data.normalize().split(' : ')
          wonsanzi[arr[0]] = arr[1]
        }
      })

      obj.result = { kcal, menu, wonsanzi }
      const sendData = JSON.stringify(obj)
        .split('\\n').join('')
        .split('\\t').join('')

      cb(null, JSON.parse(sendData))
    }
  })
}

module.exports = { food }
