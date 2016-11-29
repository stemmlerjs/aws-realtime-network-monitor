
  var colors = require('colors')
  var bcrypt = require('bcrypt-nodejs')

  switch(process.argv[2]) {
    case "createuser":
      var User = require('./app/models').User 
      var username = process.argv[3]
      var password = process.argv[4]

      if (username !== "" && username !== undefined && password !== "" && password !== undefined) {
        console.log("[createuser]: Creating new user ".yellow + "'" +  username +"'")

        // Hash the password
        bcrypt.hash(password, null, null, function(err, hash) {
          User.create({
            user_username: username,
            user_password: hash
          }).then(function(result) {
            console.log("[createuser]: Successfully created user ".green + "'" +  username + "'")

          }).catch(function(err) {
            if(err.name === "SequelizeUniqueConstraintError") {
              console.log("[createuser]: Could not create user ".red + "'" +  username +"'. Error '" + err.name + "' occurred.")
            } else {
              console.log("[createuser]: An error occurred: ".red + "'" +  err.name +"'.")    
            }
          })
        })

      } else {
        console.log("[createuser]: Username and password cannot be blank ".red)
      }
      return
    case "deluser":
      var User = require('./models').User 
      var username = process.argv[3]

      if (username !== "" && username !== undefined) {
        console.log("[deluser]: Deleting user ".yellow + "'" +  username +"'")

        User.destroy({
          where: {
            user_username: username
          }
        }).then(function(result) {
          console.log("[deluser]: Successfully deleted user ".yellow + "'" +  username +"'")

        }).catch(function(err) {
          console.log("[deluser]: Error deleting user ".red + "'" +  username +"'")
        })

      } else {
        console.log("[deluser]: Username cannot be blank ".red)
      }

      return
    default:
      console.log("")
      console.log("AWS Notification Server management utility tool to perform common tasks. ")
      console.log("")
      console.log("Usage: node manage.js [ACTION] ")
      console.log("")
      console.log(" createuser [username] [password]               Creates a new user if it doesn't exist in")
      console.log("                                                the database already.")
      console.log(" deluser [username]                             Deletes an already existing user from the")
      console.log("                                                database.")
  }