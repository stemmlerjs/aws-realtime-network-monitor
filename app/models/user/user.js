/* jshint indent: 2 */

var bcrypt = require('bcrypt-nodejs')

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    user_username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    user_password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },{
    tableName: 'user',
    instanceMethods: {
      comparePassword: function(password, callback) {
        var user = this;
        console.log(user.user_password)
        bcrypt.compare(password, user.user_password, function(err, res) {
            callback(err, res);
        });
      }
    }
  });
};