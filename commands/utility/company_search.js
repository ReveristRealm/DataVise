const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const companyList = require("../../companylist");
const { Op } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("company_search")
    .setDescription(
      "Looking for some info on a company? See who else has applied"
    )
    .addStringOption((option) =>
      option
        .setName("company")
        .setDescription("The company being added to your log")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const cpany = interaction.options.getString("company");
      var correctCompany = null;
      var company = null;

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
        company = correctCompany;
      }
      if (company) {
        const usernamesResult = await companyList.findOne({
          attributes: ["company_name", "usernames"],
          where: {
            company_name: company.get("company_name"),
          },
          raw: true,
        });
        const usernames = usernamesResult ? usernamesResult.usernames : [];
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(
            `Here are a list of people that have applied to ${company.get(
              "company_name"
            )}`
          )
          .setFields({ name: "Username", value: `${usernames.join(", ")}` })
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
