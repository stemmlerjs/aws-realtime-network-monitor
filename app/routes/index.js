module.exports = function(app, express, rootDir, models) {
  var path = require('path')
  var User = models.User

  // Base Unauthenticated Routes go here
  app.get('*', function(req, res) {
    res.send(path.join(rootDir + '/app/index.html'))
  })

  // API ROUTER
  var apiRouter = express.Router()


  // *******************************************************************************
  // ******************************* AUTHENTICATE **********************************
  // *******************************************************************************    
  
 /*   POST    /api/authenticate ================================================== //
  *   - Used to sign a JWT and return it to the user ============================= //
  *   - Creates the JWT by signing it with the user's information 
  *   
  *   @param (String) username
  *   @param (String) password
  *   @return 
  */

  apiRouter.post('/authenticate', function(req, res) {
    User.findOne({
      where: {
        username: req.body.username
      }
    }).then(function (user) {
        if (user) {
          user.comparePassword(req.body.password, function (err, result) {
            if (err) {
              res.json({
                success: false,
                message: 'An error occurred'
              })
            } else {
              if (result) {
                // Create a public user object to send back to the user
                var retUserData = {
                  user_id: user.dataValues.user_id,
                  display_name: user.dataValues.display_name,
                  date_joined: user.dataValues.createdAt
                }
                    
                // Create JWT, put the user object in the token
                var token = jwt.sign({
                  user: retUserData
                }, config.secret, {
                  expiresInMinutes: 2880
                });
                        
                res.json({
                  success: true,
                  message: 'Authenticated',
                  token: token
                });
              } else {
                res.json({
                  success: false,
                  message: 'Invalid password'
                })
              }
            }
        });
      } else {
        res.json({
          success: false,
          message: 'User not found'
        });
      }
    }) 
  })

  app.use('/api', apiRouter)
}