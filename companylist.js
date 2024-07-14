const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize"); // Adjust the path to your sequelize instance

const companyList = sequelize.define(
  "CompanyList",
  {
    company_name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    usernames: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
  },
  {
    tableName: "company_list",
    timestamps: false,
  }
);

module.exports = companyList;
