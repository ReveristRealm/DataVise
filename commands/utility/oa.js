const { SlashCommandBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const companyList = require("../../companylist");
const { fn, col, Op } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oa")
    .setDescription("If you received an OA from a company, use this command")
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
            "This company doesn't exist, ask synchro to add it."
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
          person.online_assignment &&
          person.online_assignment.includes(companyToAdd.get("company_name"))
        ) {
          await interaction.reply(
            "You already entered this company silly goose."
          );
        } else {
          await userstatus.update(
            {
              online_assignment: fn(
                "array_append",
                col("online_assignment"),
                companyToAdd.get("company_name")
              ),
            },
            {
              where: { discordUserID: discordUID },
            }
          );
          await interaction.reply(
            `I see you received an OA from ${companyToAdd.get(
              "company_name"
            )}, it has been recorded , good luck on your assessment`
          );
        }
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
