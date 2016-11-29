// ============================================== //
// ================ USER MODEL ================== //
// ============================================== //

		// ==== Get Sequelize package (used as DataType varaible) ====
		var Sequelize = require('sequelize');

		// ==== Get encryption package
		var bcrypt = require('bcrypt-nodejs');

		// ==== Get Connection to MySQL Database via Sequelize configuration ====
		var sequelize = require('../../config').dbConnection;
		
		// ==== Get Model Definition from File ====
		var user = require('./user.js')(sequelize, Sequelize);

		// Assign and create methods for the Chat_Messages model
		var User = user;

		// =========================================== //
		// ================ CLASS METHODS ================== //
		// ================================================= //

		User.methods = {
				
			/**
				* Creates the table and then synchronizes it in the database.
				* Will not overwrite old table if there are new changes to the table schema.
				* @return {Boolean} success/failure
			*/
			
			createTableIfNotExists: function(){
				User.sync().then(function(res){
					console.log("Create/if exists: User - Success".green);
					return true;
				}).catch(function(error){
					console.log("Unable to create table: User - False".red);
					return false;
				});
			},
			
			/**
				* Drop the table and then re-create it.
				* @return {Boolean} success/failure
			*/
			
			forceRecreateTable: function(){
				User.sync({force: true}).then(function(res){
						return true;
				}).catch(function(error){
						return false;
				})
			}
		};

		// ==== Return User Model ====

		module.exports = User;
