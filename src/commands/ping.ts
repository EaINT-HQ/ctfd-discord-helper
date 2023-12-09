import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("ping").setDescription("生存確認"),
    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.reply("Pong! " + interaction.client.ws.ping + "ms");
    },
};
