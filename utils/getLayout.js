const { readFileSync: read, readdir } = require('fs')
const path = require('path').resolve()

module.exports = (cb) => {
  setInterval(() => {
    readdir(path + '/layout', (err, files) => {
      if (err) console.log(err)
      const layouts = {}
      files.forEach((f) => {
        layouts[f.replace('.ejs', '')] = read(path + '/layout/' + f).toString('utf-8')
      })
      cb(layouts)
    })
  }, 1000)
}
