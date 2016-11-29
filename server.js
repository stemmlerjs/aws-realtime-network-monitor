var path    = require('path')
var express = require('express')
var helmet  = require('helmet')
var config = require('./config')
var CloudWatchClient = require('./watch')(config)
var models = require('./models')

// Start HTTP Server (Public API and Web Pages)
var app = express();
app.listen(80)

// Log traffic on HTTP Server to a log file
require('./logs')(app)

app.use(helmet())
app.use(express.static(path.join(__dirname + '/public')))
app.use('/bower', express.static(__dirname + '/bower_components'));

var server = require('http').Server(app);
var io = require('socket.io')(server);

// Socket io
server.listen(3000)

// Init API/Routes
require('./app')(app, CloudWatchClient, io, config, express, __dirname, models)



  
  
