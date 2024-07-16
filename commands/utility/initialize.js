const { SlashCommandBuilder } = require("discord.js"); // Adjust the path to your sequelize instance
const userstatus = require("../../userstatus");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("initialize")
    .setDescription(
      "To add yourself to the database so we can keep track of your progress."
    ),
  async execute(interaction) {
    try {
      const id = interaction.user.id;
      const person = await userstatus.findOne({
        where: {
          discordUserID: id,
        },
      });

      if (!person) {
        await interaction.reply("Now adding you to our database system.");
        const tag = await userstatus.create({
          discordUserID: interaction.user.id,
          username: interaction.user.username,
        });
        await interaction.editReply({
          content: `You have now been added, good luck on your search ${interaction.user.username}!`,
          ephemeral: true,
        });
      } else {
        await interaction.reply(
          `You have already been added, start applying ${interaction.user.username}!`
        );
      }
    } catch (error) {
      console.log(error);
      return interaction.reply("Something went wrong");
    }
  },
};
