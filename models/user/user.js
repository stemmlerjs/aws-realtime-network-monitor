/* jshint indent: 2 */

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
    tableName: 'user'
  });
};