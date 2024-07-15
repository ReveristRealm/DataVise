const { SlashCommandBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const companyList = require("../../companylist");
const { fn, col } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("apply")
    .setDescription("Add a company to your log")
    .addStringOption((option) =>
      option
        .setName("company")
        .setDescription("The company being added to your log")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const cpany = interaction.options.getString("company");
      const discordUID = interaction.user.id;
      const discordUser = interaction.user.username;

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
            apply: fn("array_append", col("apply"), cpany),
          },
          {
            where: { discordUserID: discordUID },
          }
        );
        await companyList.update(
          {
            usernames: fn("array_append", col("usernames"), discordUser),
          },
          {
            where: { company_name: cpany },
          }
        );
        await person.save();
        interaction.reply({
          content: "I recevied your request and it was successful, good luck",
          ephemeral: true,
        });
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
