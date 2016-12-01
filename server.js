var path    = require('path')
var express = require('express')
var helmet  = require('helmet')
var config = require('./config')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var cors = require('cors')

// Start HTTP Server (Public API and Web Pages)
var app = express();
app.listen(80)

// Log traffic on HTTP Server to a log file
//require('./logs')(app)
app.use(morgan('dev'));
app.use(cors({credentials: true, origin: true})); 
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.static(path.join(__dirname + '/public')))
app.use('/bower', express.static(__dirname + '/bower_components'));


var server = require('http').Server(app);
var io = require('socket.io')(server);

// Socket io
server.listen(3000)

// Init API/Routes
require('./app')(app, io, config, express, __dirname)



  
  
