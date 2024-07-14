const { SlashCommandBuilder } = require("discord.js");
const Sequelize = require("sequelize");

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
    const cpany = interaction.options.getString("company");
    const discordUID = interaction.user.id;
    const uname = interaction.user.username;

    await interaction.reply("Company added to your log");
  },
};
