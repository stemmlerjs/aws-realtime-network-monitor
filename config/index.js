
var awsConfig = require('./aws.js')

module.exports = {
  awsCredentials: {
    ACCESS_KEY_ID: awsConfig.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: awsConfig.SECRET_ACCESS_KEY
  },
  awsDefaultRegion: awsConfig.REGION,
}