module.exports = function(app, express, rootDir, models, CloudWatchClient) {
  var path = require('path')
  var User = models.User
  var config = require('../../config')
  var jwt = require('jsonwebtoken')

  // Unauthenticated Routes

  app.get('/login', function(req, res) {
    res.send('<h1>Login Page</h1>')
  })

  // API ROUTER
  var apiRouter = express.Router()
  var logApiRouter = express.Router()
  var ec2ApiRouter = express.Router()


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
    var username = req.body.username
    var password = req.body.password

    if (typeof username !== "string" || typeof password !== "string") {
      res.json({
        message: "Either username or password not submitted."
      })
    } else {
      User.findOne({
      where: {
        user_username: username
      }
    }).then(function (user) {
        if (user) {
          user.comparePassword(password, function (err, result) {
            if (err) {
              res.status(500).json({
                success: false,
                message: 'An error occurred',
                err: err
              })
            } else {
              if (result) {
                // Create a public user object to send back to the user
                var retUserData = {
                  user_id: user.dataValues.user_id,
                  user_username: user.dataValues.user_username,
                  createdAt: user.dataValues.createdAt
                }
                    
                // Create JWT, put the user object in the token
                var token = jwt.sign({
                  user: retUserData
                }, config.secret, {
                  expiresIn: 60 * 20 // 60 seconds * 20 = 20 minutes
                });
                        
                res.status(201).json({
                  success: true,
                  message: 'Authenticated',
                  token: token
                });
              } else {
                res.status(401).json({
                  success: false,
                  message: 'Invalid password'
                })
              }
            }
          });
        } else {
          res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
      }) 
    }
  })

  // ======================================================================================= //
  // ================================= AUTHENTICATE MIDDLEWARE ============================= //
  // =========================== Ensures that the user is authenticated on every request === //
  // =========================== all requests past this point need authentication ========== //
  // ======================================================================================= //

  function authenticationMiddleware (req, res, next) {    
    
    // Allow for token to be passed either via POST parameters, URL parameters, or HTTP header
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.netmonitorAccessToken;
      
      if (token) {
        jwt.verify(token, config.secret, function(err, decoded){
          if (err) {
            return res.status(403).send({ // 403 - forbidden
              success: false,
              message: 'Failed to Authenticate Token in REST call that requires token'
             });
          } else {
              // Set attribute on the request object so that when we pass this request through,
              // any Request will be able to tell if it is authenticated via if req.decoded != undefined
              req.decoded = decoded;
               
              next();
           }
        });
      } else {
        //Redirect to login if we cannot access any token witin cookie or header
        res.redirect('/login');
      }
  }
    
  apiRouter.use(authenticationMiddleware)
  logApiRouter.use(authenticationMiddleware)
  ec2ApiRouter.use(authenticationMiddleware)

  // ========================================================================================== //
  // All routes below this point require an access token to be in either the body, query, headers or cookie
  // ========================================================================================== //

  apiRouter.get('/test', function(req, res) {

    res.json({
      test: ';al'
    })

  })

  // ========================================================================================== //
  // /api/log/groups - Return all of the log groups/names
  // ========================================================================================== //

  logApiRouter.get('/groups', function(req, res) {
    CloudWatchClient.logs.getLogGroups()
      .then(function(data) {
        res.status(200).json(data)
      }).catch(function(err){
        res.json({
          err: err
        })
      })
  })

  // ========================================================================================== //
  // /api/log/streams - Return all of the log steams/names
  // ========================================================================================== //

  logApiRouter.get('/streams', function(req, res) {
    CloudWatchClient.logs.getLogStreams()
      .then(function(data) {
        res.status(200).json(data)
      }).catch(function(err){
        res.json({
          err: err
        })
      })
  })

  // ========================================================================================== //
  // /api/ec2/ - Return all ec2 instances
  // ========================================================================================== //

  ec2ApiRouter.get('/', function(req, res) {
    CloudWatchClient.metrics.getEC2Instances()
      .then(function(data) {
        res.status(200).json(data)
      }).catch(function(err){
        res.json({
          err: err
        })
      })
  })

  // ========================================================================================== //
  // /api/ec2/:instanceId/metrics - lists all metric (names, dimensions) for a particular EC2 instance
  // ========================================================================================== //

  ec2ApiRouter.get('/:instanceId/metrics', function(req, res) {
    var instancedId = req.params["instanceId"]

    CloudWatchClient.metrics.listEC2Metrics(instancedId)
      .then(function(data) {
        res.status(200).json(data)
      }).catch(function(err){
        res.json({
          err: err
        })
      })
  })

  // ========================================================================================== //
  // /api/ec2/metrics/stats - get metrics statistics for a particular instance
  // ========================================================================================== //

  ec2ApiRouter.post('/metrics/stats', function(req, res) {

    var startDate = req.body.startDate
    var endDate = req.body.endDate 
    var metricName = req.body.metricName 
    var namespace = req.body.namespace 
    var dimensions = req.body.dimensions

    CloudWatchClient.metrics.getMetricStats(startDate, endDate, metricName, namespace, dimensions)
      .then(function(result) {
        res.status(200).json(result)
      })
      .catch(function(err) {
        res.status(400).json({
          err: err
        })
      }) 
  })
  

  app.use('/api', apiRouter)
  apiRouter.use('/log', logApiRouter)
  apiRouter.use('/ec2', ec2ApiRouter)
}