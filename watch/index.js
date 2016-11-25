
/**
  * watch/index.js
  */

module.exports = function(config) {


  var AWS     = require('aws-sdk');
  var cwdLogs = {}
  var CloudWatchDataStore = {}
  var isInitialized = false;

  // Intialize Static resources

  initAWSConfig()
    .then(populateDataStoreLogGroupsAndStreams)
    .then(function() {
      console.log(CloudWatchDataStore)
    })
    .catch(handleError)


  /* 
  * Public Constructor
  */    

  return {

    getLogGroups: function() {
      return CloudWatchDataStore.logGroups
    },

    getLogGroupNames: function() {
      return CloudWatchDataStore.logGroupName
    },

    getLogStreams: function() {
      return CloudWatchDataStore.logStreams
    },

    getLogStreamNames: function() {
      return CloudWatchDataStore.logStreamNames
    },

    isReady: function() {
      return isInitialized
    }
    
  }

  /*
  * ============ Private Methods ==============
  */

  /*
  * handleError
  *
  * "Handles" error by printing it for now
  * @param {String} err
  */

  function handleError(err) {
    console.log(err)

  }
  
  /*
  * initAWSConfig
  *
  * Initializes the AWS Config with our credentials and default region.
  * @return {Promise}
  */

  function populateDataStoreLogGroupsAndStreams() {
    return new Promise(function(resolve, reject) {

      cwdLogs = new AWS.CloudWatchLogs();
        
      try {
        // Get all log groups
        cwdLogs.describeLogGroups({}, function(err, data) {
          CloudWatchDataStore.logGroups = data.logGroups
          CloudWatchDataStore.logGroupNames = data.logGroups.map(function(el) {
            return el.logGroupName
          })

          // Get all log streams
          for(var i = 0; i < CloudWatchDataStore.logGroupNames.length; i++) {

            var apiConf = {
              logGroupName: CloudWatchDataStore.logGroupNames[i],
              descending: true
            }

            cwdLogs.describeLogStreams(apiConf, function(err, data) {
              CloudWatchDataStore.logStreams = data.logStreams
              CloudWatchDataStore.logStreamNames = data.logStreams.map(function(el) {
                return el.logStreamName
              })
              isInitialized = true;
              resolve()
            })
          }
        })
      } catch(err) {
        reject()
      }
    })
  }

  /*
  * initAWSConfig
  *
  * Initializes the AWS Config with our credentials and default region.
  * @return {Promise}
  */

  function initAWSConfig() {
    return new Promise(function(resolve, reject) {
      AWS.config.update({
        accessKeyId: config.awsCredentials.ACCESS_KEY_ID,
        secretAccessKey: config.awsCredentials.SECRET_ACCESS_KEY
      })

      AWS.config.region = config.awsDefaultRegion;
      resolve()
    })  
  }

}