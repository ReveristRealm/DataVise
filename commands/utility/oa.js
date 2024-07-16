const { SlashCommandBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const companyList = require("../../companylist");
const { fn, col, Op } = require("sequelize");

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
        const correctCompany = await companyList.findOne({
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
        } else {
          await interaction.reply(
            `Did you mean to enter ${correctCompany.get(
              "company_name"
            )}, sorry im case-sensitive... try it again. `
          );
        }
      } else if (!person) {
        await interaction.reply(
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
        await interaction.reply(
          `I see you received an OA from ${cpany}, it has been recorded , good luck on your assessment`
        );
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
