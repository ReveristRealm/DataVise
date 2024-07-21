const { SlashCommandBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const companyList = require("../../companylist");
const { fn, col, Op } = require("sequelize");

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
      var correctCompany = null;
      var company = null;

      const person = await userstatus.findOne({
        where: {
          discordUserID: discordUID,
        },
      });
      company = await companyList.findOne({
        where: {
          company_name: cpany,
        },
      });
      if (!company) {
        correctCompany = await companyList.findOne({
          where: {
            company_name: {
              [Op.iLike]: cpany,
            },
          },
        });
        if (!correctCompany) {
          await interaction.reply(
            "This company doesnt exist, ask synchro to add it."
          );
        }
      }
      if (!person) {
        await interaction.reply(
          "You need to run the /initialize command to add yourself to the database first"
        );
      } else if ((company && person) || (correctCompany && person)) {
        const companyToAdd = company || correctCompany;
        if (
          person.apply &&
          person.apply.includes(companyToAdd.get("company_name"))
        ) {
          await interaction.reply("You already applied here silly goose.");
        } else {
          await userstatus.update(
            {
              apply: fn(
                "array_append",
                col("apply"),
                companyToAdd.get("company_name")
              ),
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
              where: { company_name: companyToAdd.get("company_name") },
            }
          );
          await interaction.reply(
            `I recevied your request to apply to ${companyToAdd.get(
              "company_name"
            )} and it was successful, good luck`
          );
        }
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
