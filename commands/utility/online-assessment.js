const { SlashCommandBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const companyList = require("../../companylist");
const { fn, col } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oa")
    .setDescription("If you recived an OA from a company, use this command")
    .addStringOption((option) =>
      option
        .setName("company")
        .setDescription("The company being added to your log")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const discordUser = interaction.user.username;
      const cpany = interaction.options.getString("company");
      const discordUID = interaction.user.id;

      const person = await userstatus.findOne({
        where: {
          discordUserID: discordUID,
        },
      });
      const company = await companyList.findOne({
        where: {
          company_name: cpany,
        },
      });
      if (!company) {
        interaction.reply(
          "We couldnt find this company in the system, make a request using /request_addcompany to add it"
        );
      } else if (!person) {
        interaction.reply(
          "You need to run the /initialize command to add yourself to the database first"
        );
      } else if (company && person) {
        await userstatus.update(
          {
            online_assignment: fn(
              "array_append",
              col("online_assignment"),
              cpany
            ),
          },
          {
            where: { discordUserID: discordUID },
          }
        );
        await person.save();
        interaction.reply({
          content:
            "I recevied your request and it was successful, good luck on your assessment",
          ephemeral: true,
        });
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
