
var awsConfig = require('./aws.js')
var sequelize = require('./db')

module.exports = {
  awsCredentials: {
    ACCESS_KEY_ID: awsConfig.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: awsConfig.SECRET_ACCESS_KEY
  },
  awsDefaultRegion: awsConfig.REGION,
  dbConnection: sequelize !== null ? sequelize : 'Could not init database connection.'
}