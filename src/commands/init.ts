import {
    CacheType,
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    User,
} from "discord.js";
import got from "got";
import { setTimeout as wait } from "node:timers/promises";

type CtfdResponse = {
    success: boolean;
    data: {
        id: number;
        type: string;
        name: string;
        value: number;
        solves: number;
        solved_by_me: boolean;
        category: string;
        tags: string[];
        template: string;
        script: string;
    }[];
};

async function fetchChallenges(host: string, token: string) {
    const response = await got(`${host}/api/v1/challenges`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    }).json<CtfdResponse>();
    return response;
}

export default {
    data: new SlashCommandBuilder()
        .setName("init")
        .setDescription(
            "Fetch the challenges from the ctfd system and create a threads."
        )
        .addStringOption((option) =>
            option
                .setRequired(true)
                .setName("host")
                .setDescription("ctfd host. like a `https://demo.ctfd.io`")
        )
        .addStringOption((option) =>
            option
                .setRequired(true)
                .setName("token")
                .setDescription(
                    "An access token created with user privileges. Created from settings.`"
                )
        )
        .addUserOption((option) =>
            option
                .setName("member1")
                .setDescription(
                    "Specifies members that are automatically added when a thread is created."
                )
        ),
    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const host = interaction.options.getString("host", true);
        const token = interaction.options.getString("token", true);
        const members: User[] = [];
        {
            const m = interaction.options.getUser("member1");
            if (m) members.push(m);
        }

        interaction.deferReply();

        if (interaction.channel === null) {
            await interaction.editReply(
                "Please run this command in a channel."
            );
            return;
        }
        if (interaction.channel.type !== ChannelType.GuildText) {
            await interaction.editReply(
                "Please run this command in a text channel."
            );
            return;
        }

        try {
            const challenges = await fetchChallenges(host, token);
            if (!challenges.success) {
                await interaction.followUp(
                    "Failed to fetch challenges. Invalid token?"
                );
                return;
            }
            console.log(challenges);

            for (const challenge of challenges.data) {
                const { category, name } = challenge;

                const thread = await interaction.channel.threads.create({
                    name: `${category} - ${name}`,
                });
                thread.members.add(interaction.user);
                for (const member of members) {
                    thread.members.add(member);
                }
                console.log(
                    "Created a thread: " + thread.name + " " + thread.id,
                    thread
                );

                await wait(1000);
            }

            await interaction.followUp("Done!");
        } catch (error) {
            console.error(error);
            await interaction.followUp(
                "Failed to fetch challenges. Invalid host?"
            );
        }
    },
};
