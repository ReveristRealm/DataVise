const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const userstatus = require("../../userstatus");
const { fn, col } = require("sequelize");
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
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`Congratulations ${discordUser}`)
          .setDescription(
            "On behalf of the Code For All Board, Congratulations. We are proud of you and knew you could do it!"
          )
          .setThumbnail(avatarURL)
          .setFields(
            { name: "Interning at", value: `${cpany}` },
            { name: "Applied", value: "To be determined", inline: true },
            {
              name: "Online-Assessment",
              value: "To be determined",
              inline: true,
            },
            { name: "Rejected", value: "To be determined", inline: true }
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
