module.exports = function(io) {

  var LogStreamConnectionsTable = require('./log-stream-connections-table.js')

  io.on('connection', function (socket) {
    console.log("[ESTABLISHED]: A socket with id = " + socket.id + " connected.")

    socket.on('disconnect', function() {
      // If socket was in log stream, clear it

      // otherwise, 
      console.log("[DISCONNECT]: Socket id = " + socket.id + " disconnected.")
    })
  });

} 

