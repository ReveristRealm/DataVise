const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const { fn, col, literal } = require("sequelize");
const companyList = require("../../companylist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("offer")
    .setDescription("If you received an offer from a company,use this command")
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
      const company = await companyList.findOne({
        where: {
          company_name: cpany,
        },
      });
      if (!company) {
        interaction.reply(
          "We couldnt find this company in the system, make a request using /request_addcompany to add it"
        );
      } else if (!person) {
        interaction.reply(
          "You need to run the /initialize command to add yourself to the database first"
        );
      } else if (company && person) {
        await userstatus.update(
          {
            accepted: fn("array_append", col("accepted"), cpany),
          },
          {
            where: { discordUserID: discordUID },
          }
        );
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
        const result4 = await userstatus.findOne({
          attributes: [
            "username",
            [
              literal("COALESCE(SUM(ARRAY_LENGTH(accepted, 1)), 0)"),
              "accepted_sum",
            ],
          ],
          where: {
            discordUserID: discordUID,
          },
          group: ["username"],
        });
        const acceptedSum = result4 ? result4.get("accepted_sum") : 0;
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`Congratulations ${discordUser}`)
          .setDescription(
            "On behalf of the Code For All Board, Congratulations. We are proud of you and knew you could do it!"
          )
          .setThumbnail(avatarURL)
          .setFields(
            { name: "Interning at", value: `${cpany}` },
            { name: "Applied", value: `${applySum}`, inline: true },
            {
              name: "Online-Assessment",
              value: `${oaSum}`,
              inline: true,
            },
            { name: "Rejected", value: `${rejectedSum}`, inline: true },
            {
              name: "Accepted",
              value: `${acceptedSum}`,
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
