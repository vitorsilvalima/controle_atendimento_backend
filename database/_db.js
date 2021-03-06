const sequelize = require('sequelize');
const debug = require('debug')('myapp:db:sequelize');

const config = {
  "username": process.env.DB_USERNAME || "redhat",
  "password": process.env.DB_PASSWORD || "redhat",
  "database": "atendimento_db",
  "host": process.env.db_url || 'localhost',
  "dialect": "postgres",
  "pool": {
    "max": 20,
    "min": 5
  },
  "freezeTableName": true,
  "underscored":true,
  "timestamps": false,
  "omitNull": true,
  "timezone": "Brazil/East",
  "logging": debug
}

const db = new sequelize(config.database, config.username, config.password, config);

db
.authenticate()
.then(function(err) {
    console.log("Connecting  to database with the following config: \n %j",config);
    debug("Connecting  to database with the following config: \n %j",config)
})
.catch( err => {
    debug("Error connecting  to database with the following config: \n %j",config)
    debug('Error: %s', err);
    console.error('Error: %s', err);
});

module.exports = db;