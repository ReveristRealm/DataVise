const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("OA")
    .setDescription("If you recived an OA from a company, use this command")
    .addStringOption((option) =>
      option
        .setName("company")
        .setDescription("The company being added to your log")
        .setRequired(true)
    ),
  async execute(interaction) {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    await interaction.reply("Pong!");
  },
};
