module.exports = function(app, CloudWatchClient, io, config, express, rootDir, models) {

  // Init HTTP Server and APIs
  require('./routes')(app, express, rootDir, models)

  // Init Server TCP Socket Module
  require('./socket')(io)

}