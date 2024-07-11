const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reject")
    .setDescription("If you get rejected by a company, use this command :(")
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
