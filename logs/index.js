

var morgan  = require('morgan')
var fs      = require('fs')
var path    = require('path')

module.exports = function(app) {
	// create a write stream (in append mode)
  var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
  app.use(morgan('combined', {stream: accessLogStream}))
}

