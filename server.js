var path    = require('path')
var express = require('express')
var helmet  = require('helmet')
var config = require('./config')

var app = express();
app.listen(80)

var server = require('http').Server(app);
var io = require('socket.io')(server);

require('./logs')(app)

var CloudWatchClient = require('./watch')(config)

app.use(helmet())
app.use(express.static(path.join(__dirname + '/app')))
app.use('/bower', express.static(__dirname + '/bower_components'));

app.get('/', function(req, res) {
  res.send(path.join(__dirname + '/app/index.html'))
})

// Socket io
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  console.log("A SOCKET CONNECTED", socket)
});

// setTimeout(function() {

//   CloudWatchClient.getLogData('/var/log/messages', ['i-0fb837bcaaa38bc3d'], function(err, data) {
//     console.log("GOT THE DATA", data)
//   })

// },1500)



  
  
