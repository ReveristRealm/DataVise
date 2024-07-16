const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const companyList = require("../../companylist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("new_comp")
    .setDescription(
      "Only synchro can run this, if you need a company added, let him know"
    )
    .addStringOption((option) =>
      option
        .setName("company")
        .setDescription("The company being added to your log")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      if (interaction.user.username != process.env.KING) {
        interaction.reply("You cant run this command, ask synchro");
      }
      const cpany = interaction.options.getString("company");

      const [company, created] = await companyList.findOrCreate({
        where: {
          company_name: cpany,
        },
      });
      if (created) {
        await interaction.reply("Company was created");
      } else {
        await interaction.reply("Company already exist");
      }
    } catch (error) {
      await interaction.reply("Something broke, oops", error);
      console.log(error);
    }
  },
};
