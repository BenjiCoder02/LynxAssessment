require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DB_NAME,
  process.env.MYSQL_DB_USER,
  process.env.MYSQL_DB_PASSWORD, {
  host: process.env.MYSQL_DB_URI,
  dialect: 'mysql',
});

sequelize.authenticate()
  .then(() => console.log('Connected to MySQL'))
  .catch((err) => console.error('Unable to connect to MySQL: ', err));

module.exports = sequelize;
