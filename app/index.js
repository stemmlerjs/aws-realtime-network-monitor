module.exports = function(app, io, config, express, rootDir) {
  
  var models = require('./models')
  var CloudWatchClient = require('./watch')(config)

  // Init HTTP Server and APIs
  require('./routes')(app, express, rootDir, models, CloudWatchClient)

  // Init Server TCP Socket Module
  require('./socket')(io)

}