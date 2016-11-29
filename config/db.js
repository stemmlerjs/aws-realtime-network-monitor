var Sequelize = require('sequelize')

var sequelize = new Sequelize('database', 'root', null, {
  host: 'localhost',
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false,

  // SQLite only
  storage: './db.sqlite'
});

sequelize
  .authenticate()
  .then(function(err) {
    console.log('[SQLITE]: Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('[SQLITE]: Unable to connect to the database:', err);
  });

module.exports = sequelize
