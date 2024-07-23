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
        //----------------------------------------------------------
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
        //-------------------------------------------------------------
        const comappResult = await userstatus.findOne({
          attributes: [
            "discordUserID",
            "username",
            "online_assignment",
            [literal("array_to_string(apply, '|^|')"), "apply_company"],
          ],
          where: {
            discordUserID: discordUID,
          },
          raw: true,
        });

        let comapplist = [];

        if (comappResult && comappResult.apply_company) {
          comapplist = comappResult.apply_company.split("|^|");
        }
        //---------------------------------------------------------
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
        //-----------------------------------------------------
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
        //-----------------------------------------------------
        const comoaResult = await userstatus.findOne({
          attributes: [
            "discordUserID",
            "username",
            [
              literal("array_to_string(online_assignment, '|^|')"),
              "oa_company",
            ],
          ],
          where: {
            discordUserID: discordUID,
          },
          raw: true,
        });

        let comoalist = [];

        if (comoaResult && comoaResult.oa_company) {
          comoalist = comoaResult.oa_company.split("|^|");
        }
        //----------------------------------------------------------
        const comrejResult = await userstatus.findOne({
          attributes: [
            "discordUserID",
            "username",
            [literal("array_to_string(rejected, '|^|')"), "rejected_company"],
          ],
          where: {
            discordUserID: discordUID,
          },
          raw: true,
        });

        let comrejlist = [];

        if (comrejResult && comrejResult.rejected_company) {
          comrejlist = comrejResult.rejected_company.split("|^|");
        }
        //----------------------------------------------------------
        const comaccResult = await userstatus.findOne({
          attributes: [
            "discordUserID",
            "username",
            [literal("array_to_string(accepted, '|^|')"), "accepted_company"],
          ],
          where: {
            discordUserID: discordUID,
          },
          raw: true,
        });

        let comacclist = [];

        if (comaccResult && comaccResult.accepted_company) {
          comacclist = comaccResult.accepted_company.split("|^|");
        }
        //----------------------------------------------------------
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
            },
            {
              name: "Accepted",
              value: `${acceptedSum}`,
              inline: true,
            }
          )
          .setTimestamp();
        if (comapplist.length > 0) {
          embed.addFields({
            name: "Companies you applied to",
            value: comapplist.join(", ") || "None",
          });
        } else {
          embed.addFields({ name: "Companies you applied to", value: "None" });
        }
        if (comoalist.length > 0) {
          embed.addFields({
            name: "Companies that gave you online-assessments:",
            value: comoalist.join(", ") || "None",
          });
        } else {
          embed.addFields({ name: "OA's from Companies:", value: "None" });
        }
        if (comrejlist.length > 0) {
          embed.addFields({
            name: "Companies that rejected you:",
            value: comrejlist.join(", ") || "None",
          });
        } else {
          embed.addFields({
            name: "Companies that rejected you:",
            value: "None",
          });
        }
        if (comacclist.length > 0) {
          embed.addFields({
            name: "Companies that accepted you:",
            value: comacclist.join(", ") || "None",
          });
        } else {
          embed.addFields({
            name: "Companies that accepted you:",
            value: "None",
          });
        }
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply("Error updating database with  your info", error);
      console.log(error);
    }
  },
};
