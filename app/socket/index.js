module.exports = function(io, config, CloudWatchClient) {


  var LogStreamConnectionsTable = require('./log-stream-connections-table.js')
  var socketioJwt = require('socketio-jwt')

  io.sockets
    // Initial Authentication (JWT)
    .on('connection', socketioJwt.authorize({
      secret: config.secret,
      timeout: 15000 // 15 seconds to send the authentication message
    }))
    .on('authenticated', initAuthenticatedSocket);

    /*
    * LogDispatcher
    *
    * This mini-class dispatches log events data every 10 seconds for a socket connection.
    *
    * @class
    * @construtor {String}  socketId
    */

    function LogDispatcher(socketId) {
      // Unique 'active' socket id 
      this.socketId = socketId

      /*
      * emitLogData
      *
      * This function emits log data to the socket connection every 10 seconds.
      * If the socket is no longer in the LogStreamConnectionsTable, then the
      * interval for emitting data is cancelled. 
      *
      * @return void
      */

      this.emitLogData = function() {
        var thisSocket = io.sockets.connected[this.socketId]

        // If the socket still exists, we will send log data to the socket
        if (thisSocket) {
          console.log("[LogDispatcher]: Emitting data for socket id=", this.socketId)
          var logParams = LogStreamConnectionsTable.get(this.socketId)

          CloudWatchClient.logs
            .getLogData(logParams.logGroupName, logParams.logStreamNames,
          function(err, logs) {
            thisSocket.emit('logdata', logs)
          })

        // If the socket no longer exists, we will stop sending log data
        } else {
          console.log("[LogDispatcher]: Killing interval socket id=", this.socketId)
          clearInterval(this.interval)
        }
      }

      /*
      * interval
      *
      * The interval function that calls on emitLogData. What's important here
      * is that we need to bind the context of 'this' to the execution context
      * of the emitLogData function. emitLogData needs access to the properties
      * of 'this' (this.socketId).
      *
      * @return void
      */

      this.interval = setInterval(this.emitLogData.bind(this), 10000)

      this.emitLogData()
    }

  /*
  * initAuthenticatedSocket
  * 
  * Once the socket is authenticatd, we are alright to continue with the protocol.
  * Basically, the next step in the protocol is to wait for a LOG_STREAM_REQUEST.
  * On a valid LOG_STREAM_REQUEST, we will allocate an entry in the LogStreamConnections table
  * and maintain a stream for this connection.
  *
  * @param {Object} socket
  * @return void
  */

  function initAuthenticatedSocket (socket) {
    console.log("[ESTABLISHED]: A socket with id = " + socket.id + " connected.")

    socket.on('LOG_STREAM_REQUEST', handleLogStreamRequest)

    socket.on('disconnect', function() {
      // If socket was in log stream, clear it
      LogStreamConnectionsTable.del(socket.id)

      // otherwise, 
      console.log("[DISCONNECT]: Socket id = " + socket.id + " disconnected.")
    })

    /*
    * handleLogStreamRequest
    *
    * @param {Object} data (valid logStreamData containing logGroupName {String}
    *                       and logStreamNames {Array[{String}]})
    * @return void
    */

    function handleLogStreamRequest(data) {
      var logGroupName = data.logGroupName;
      var logStreamNames = data.logStreamNames;

      if (logGroupName === undefined || logStreamNames === undefined) {
        socket.emit('LOG_STREAM_RESPONSE', {
          reason: 'Bad request parameters',
          success: false
        })
      } else {

        // Insert socket and logStreamParams into table
        LogStreamConnectionsTable.add(socket.id, {
          logGroupName: logGroupName,
          logStreamNames: logStreamNames
        }, function(err, insertMsg) {
          if(err) {
            console.log("!!! Problem inserting into log group table", err)
          } else {

            console.log("[STREAM] Just added socket id=" + socket.id + " to LogStream table. Type=", insertMsg)

          // Emit successful addition
          socket.emit('LOG_STREAM_RESPONSE', {
            success: true
          })

          // Start stream for socket
          //setLogStreamPoller()
          var logger = new LogDispatcher(socket.id)

          }
        })
      }
    }


    function setLogStreamPoller () {

      var logStreamParams = LogStreamConnectionsTable.get(socket.id)

      console.log("Attempting to return logs for params", logStreamParams)
      CloudWatchClient.logs
        .getLogData(logStreamParams.logGroupName, logStreamParams.logStreamNames,
        function(err, logs) {
          socket.emit('logdata', logs)
        })

    }
  } // End Main Application
} 

