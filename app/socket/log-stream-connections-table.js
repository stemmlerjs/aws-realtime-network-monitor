

var connectionsTable = {}      // key: socketId, value: { logGroupName, logstreamNames}

/*
* addConnectionToTable
*
* Add a connection entry consisting of a socketId and a logStreamParams object to the table.
* 
* @param {String} socketId
* @param {Object} logStreamParams - contains keys (logGroupName - string, logStreamNames - array[string])
* @param {Function} callback
* @return void
*/

function addConnectionToTable (socketId, logStreamParams, callback) {
  var errorExists = false

  if (typeof logStreamParams !== 'object') {
    callback(new Error('Log Parameters provided is not an object.'))
    errorExists = true
  } else {
    if (!logStreamParams.hasOwnProperty('logGroupName')) {
      callback(new Error('logGroupName - attribute not provided.'))
      errorExists = true
    } 
    if (!logStreamParams.hasOwnProperty('logStreamNames')){
      callback(new Error('logStreamNames - attribute not provided.'))
      errorExists = true
    } 
  }

  if (typeof socketId !== "string") {
    callback(new Error('Socket Id not provided.'))
    errorExists = true
  }

  // Only continue if an error didn't occur (ie: relevant data was provided)
  if (!errorExists) {
    var insertMsg = ""

    if(connectionsTable.hasOwnProperty(socketId)) {
      insertMsg = "OVERWRITE"
    } else {
      insertMsg = "NEW"
    }

    connectionsTable[socketId] = logStreamParams
    callback(null, insertMsg)
  }
}

/*
* deleteConnectionFromTable
*
* Deletes a specific connection from the table based on socketId key.
* @param {String} socketId
* @return void
*/

function deleteConnectionFromTable (socketId) {
  delete connectionsTable[socketId]
}

/*
* getLogStreamParams
*
* Returns the logStreamParams object for a particular socket connection
* @param {String} socketId
* @return void
*/

function getLogStreamParams (socketId) {
  return connectionsTable[socketId]
}

module.exports = {
  add: addConnectionToTable,
  del: deleteConnectionFromTable
}