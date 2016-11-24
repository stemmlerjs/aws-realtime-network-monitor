
/**
  * config/aws.js
  * 
  * This file provides the config object used by the AWS SDK to authenticate our API calls
  * to the AWS cloud.
  * We obtain the access keys from environment variables.
  */

module.exports = {
  ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  REGION: 'us-east-1'
}

