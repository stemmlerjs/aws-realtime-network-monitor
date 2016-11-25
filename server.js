var path    = require('path')
var express = require('express')
var helmet  = require('helmet')
var config = require('./config')

var app = express();
app.listen(3000)

require('./logs')(app)

var CloudWatchClient = require('./watch')(config)

app.use(helmet())
app.use(express.static(path.join(__dirname + '/app')))
app.use('/bower', express.static(__dirname + '/bower_components'));

app.get('/', function(req, res) {
  res.send(path.join(__dirname + '/app/index.html'))
})





