import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ac")
        .setDescription(
            "Mark the current thread as AC. Can only be used inside a thread.",
        ),
    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const { channel } = interaction;

        try {
            if (channel === null) {
                return;
            }

            if (!channel.isThread()) {
                await interaction.reply({
                    content: "⚠️ Use this command in a thread.",
                    ephemeral: true,
                });
                return;
            }

            if (channel.name.match(/^✅ /)) {
                interaction.reply({
                    content: "⚠️ This thread seems to have already completed!",
                    ephemeral: true,
                });
                return;
            }

            channel.setName("✅ " + channel.name);
            interaction.reply("✅ Good Job!");
            return;
        } catch (error) {
            console.error(error);
            throw new Error("Error while marking thread as AC");
        }
    },
};
