const Sequelize = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_Name,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: "localhost",
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection wwas established");
  })
  .catch((err) => {
    console.error("Unable to connect to the database", err);
  });

module.exports = sequelize;
