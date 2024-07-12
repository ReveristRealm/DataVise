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
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    await interaction.reply("Company added to your log");
  },
};
