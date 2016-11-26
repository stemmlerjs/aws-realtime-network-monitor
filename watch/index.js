
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

      var params = {
        EndTime: new Date, /* required */
        Period: 6000000, /* required */
        StartTime: new Date(2011,10,30), /* required */
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/EC2',
        Statistics: [
          'Average',
          'Sum'
        ],
        Dimensions: [
          {
            Name: 'InstanceId', /* required */
            Value: "i-0fb837bcaaa38bc3d"
          }
          /* more items */
        ]
      }
      console.log("******************************************")
      var cloudwatch = new AWS.CloudWatch();

      cloudwatch.getMetricStatistics(params, function(err, data) {
        if(err) {
          console.log(":(", err)
        }
        console.log(data)
      })

    })


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
    },

    /*
    * getLogData
    * 
    * This method actually returns the logs! 
    * @param {String} logGroupName
    * @param {Array} logStreamNamesArr
    * @param {Function} callback
    * @return void
    */

    getLogData: function(logGroupName, logStreamNamesArr, callback) {
      if (isInitialized) {
        cwdLogs.filterLogEvents({
          logGroupName: logGroupName,
          logStreamNames: logStreamNamesArr
        }, callback)
      } else {
        callback(new Error('CloudWatchClient not ready.'))
      }
    }

  }

  /*
  * ============ Private Methods ==============
  */

  
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
