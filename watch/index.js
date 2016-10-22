
module.exports = function(config) {

  var AWS     = require('aws-sdk');
  AWS.config.update({
    accessKeyId: config.awsCredentials.ACCESS_KEY_ID,
    secretAccessKey: config.awsCredentials.SECRET_ACCESS_KEY
  })

  AWS.config.region = config.awsDefaultRegion;

  new AWS.EC2().describeInstances(function(error, data) {
    if (error) {
      console.log(error); // an error occurred
    } else {
      console.log(data); // request succeeded
    }
  });

  new AWS.EC2().describeKeyPairs(function(error, data) {
    if (error) {
      console.log(error); // an error occurred
    } else {
      console.log(data); // request succeeded
    }
  });

  var params = {
    logGroupName: 'STRING_VALUE', /* required */
    descending: true || false,
    limit: 0,
    logStreamNamePrefix: 'STRING_VALUE',
    nextToken: 'STRING_VALUE',
    orderBy: 'LogStreamName | LastEventTime'
  };
  
  new AWS.CloudWatchLogs().describeLogStreams(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

}