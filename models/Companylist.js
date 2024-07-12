const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // Adjust the path to your sequelize instance
const { TimestampStyles } = require("discord.js");

const CompanyList = sequelize.define(
  "CompanyList",
  {
    company: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "company_list",
    timestamps: false,
  }
);

module.exports = CompanyList;
