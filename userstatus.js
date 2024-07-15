const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize"); // Adjust the path to your sequelize instance

// Define a UserStatus model to match the existing user_status table
const userstatus = sequelize.define(
  "userstatus",
  {
    discordUserID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    online_assignment: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    apply: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    accepted: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
  },
  {
    tableName: "codeforall", // Specify the existing table name
    timestamps: false, // Disable timestamps if your table doesn't have createdAt/updatedAt columns
  }
);

module.exports = userstatus;
