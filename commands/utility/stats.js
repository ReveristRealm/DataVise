const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const { literal } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show your stats for this cycle"),
  async execute(interaction) {
    try {
      const discordUID = interaction.user.id;
      const discordUser = interaction.user.username;
      const avatarURL = interaction.user.displayAvatarURL({
        format: "png",
        dynamic: true,
        size: 1024,
      });

      const person = await userstatus.findOne({
        where: {
          discordUserID: discordUID,
        },
      });
      if (!person) {
        interaction.reply(
          "You need to run the /initialize command to add yourself to the database first"
        );
      } else if (person) {
        const result = await userstatus.findOne({
          attributes: [
            "username",
            [literal("COALESCE(SUM(ARRAY_LENGTH(apply, 1)), 0)"), "apply_sum"],
          ],
          where: {
            discordUserID: discordUID,
          },
          group: ["username"],
        });
        const applySum = result ? result.get("apply_sum") : 0;

        const result2 = await userstatus.findOne({
          attributes: [
            "username",
            [
              literal("COALESCE(SUM(ARRAY_LENGTH(rejected, 1)), 0)"),
              "rejected_sum",
            ],
          ],
          where: {
            discordUserID: discordUID,
          },
          group: ["username"],
        });
        const rejectedSum = result2 ? result2.get("rejected_sum") : 0;

        const result3 = await userstatus.findOne({
          attributes: [
            "username",
            [
              literal("COALESCE(SUM(ARRAY_LENGTH(online_assignment, 1)), 0)"),
              "oa_sum",
            ],
          ],
          where: {
            discordUserID: discordUID,
          },
          group: ["username"],
        });
        const oaSum = result3 ? result3.get("oa_sum") : 0;

        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`Stats for ${discordUser}`)
          .setDescription("Here is how your doing so far in this cycle.")
          .setThumbnail(avatarURL)
          .setFields(
            { name: "Applied", value: `${applySum}`, inline: true },
            {
              name: "Rejected",
              value: `${rejectedSum}`,
              inline: true,
            },
            {
              name: "Online-Assignment",
              value: `${oaSum}`,
              inline: true,
            }
          )
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
