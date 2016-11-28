
/**
  * watch/index.js
  */

module.exports = function(config) {


  var AWS     = require('aws-sdk');
  var cwdLogs = {}                      // CloudWatchLogs API Obj
  var cwdMetrics = null                 // CloudWatch (Metrics) API Obj
  var cwdEC2 = null                     // EC2 API Obj
  var CloudWatchDataStore = {}          // Data Store. Contains Session Logs and Metrics Data.
  var EC2InstancesList = []             // Each EC2 Instance 
  var isInitialized = false;            

  // Intialize Static resources

  initAWSConfig()
    .then(getEC2Instances)
    .then(populateDataStoreLogGroupsAndStreams)
    .then(function() {
      //console.log(CloudWatchDataStore)
        // listEC2Metrics("i-0fb837bcaaa38bc3d")

    })
    .catch(function(err) {
      console.log(err)
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
    * @param {Array} logStreamNamesArr - the names of all of the streams that we want to see
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
  * getMetricStats
  *
  * Gets stats for a particular metric.
  *
  * @params {Date}  startDate
  * @params {Date}  endDate
  * @params {String}  metricName
  * @params {String}  namespace
  * @params {Object}  dimensions
  * @return {Promise}
  */

  function getMetricStats (startDate, endDate, metricName, namespace, dimensions) {
    return new Promise(function(resolve, reject) {

      if (cwdMetrics == null) {
        cwdMetrics = new AWS.CloudWatch();
      }

      var params = {
        EndTime: endDate,         //* required */
        Period: 6000000,          // * required */
        StartTime: startDate,     // * required */
        MetricName: metricName,   // new Date(2011,10,30)
        Namespace: namespace,     // 'AWS/EC2'
        Statistics: [
          'Average',
          'Sum',
          'Minimum',
          'Maximum'
        ],
        Dimensions: [dimensions]          //    {  Name: 'InstanceId', Value: "i-0fb837bcaaa38bc3d"  }
      }

      cwdMetrics.getMetricStatistics(params, function(err, data) {
        if(err) {
          reject(err)
        } else {
          console.log("")
          console.log("******************************************")
          console.log("           getMetricStatistics() ")
          console.log("")
          console.log(data)
          resolve()
        }
      })



    })
  }

  /*
  * listEC2Metrics
  *
  * Returns all of the metrics for a particular EC2 Instance for where the 
  * InstanceId is a uniquely identifying attribute.
  *
  * Each Metric contains:
  *   - Metric Name
  *   - Dimensions
  *
  * @params {String} instanceId
  * @return {Promise}
  */

  function listEC2Metrics (instanceId) {
    return new Promise(function(resolve, reject) {
      var param = {
        Dimensions: [
          {
            Name: 'InstanceId',             /* required - we always use this*/
            Value: instanceId               /*          - @param instanceId */
          }
        ]
      }

      cwdMetrics.listMetrics(param, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject()
        } 
        else {
          console.log("")
          console.log("******************************************")
          console.log("           listEC2Metrics() - ")
          console.log("         InstanceID: ", instanceId)
          console.log("")
          console.log("Found " + data.Metrics.length + " metrics. ")
          resolve(data.Metrics)
        }     
      });
    })
  }

  /*
  * getEC2Instances
  *
  * Gets all the EC2 Instance objects and adds them to the EC2 Instance
  * @return {Promise}
  */

  function getEC2Instances () {
    return new Promise(function(resolve, reject) {
      if (cwdEC2 == null) {
        cwdEC2 = new AWS.EC2()
      }


      cwdEC2.describeInstances({}, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
        } else {
          console.log("")
          console.log("******************************************")
          console.log("       EC2 - GETTING INSTANCES STATE ")
          console.log("           describeInstances() ")
          console.log("")
          for(var i = 0; i < data.Reservations.length; i++) {

            var instance = data.Reservations[i].Instances[0]
            EC2InstancesList.push(instance)

            console.log("[EC2]: Added Instance " + instance.InstanceId + " to local list. State: " + instance.State.Name)
          }
          console.log("")
          resolve()
        }
      });
    })
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
              console.log("")
              console.log("******************************************")
              console.log("         OBTAINED ALL THE LOG GROUPS      ")
              console.log("           describeLogGroups() ")
              console.log("")
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
