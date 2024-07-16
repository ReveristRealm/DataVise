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
        await interaction.reply(
          "This company doesnt exist, ask synchro to add it."
        );
      } else if (!person) {
        await interaction.reply(
          "You need to run the /initialize command to add yourself to the database first"
        );
      } else if (company && person) {
        if (person.apply.includes(cpany)) {
          await interaction.reply("You already applied here silly goose.");
        } else {
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
          await interaction.reply(
            `I recevied your request to apply to ${cpany} and it was successful, good luck`
          );
        }
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
