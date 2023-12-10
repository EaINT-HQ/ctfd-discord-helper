import {
    CacheType,
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    User,
} from "discord.js";
import got, { Got } from "got";
import { setTimeout as wait } from "node:timers/promises";
import { CtfdResponseChallengeDetail, CtfdResponseChallenges } from "../types";

function ctfdCleint(host: string, token: string) {
    return got.extend({
        prefixUrl: host,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
}

async function fetchChallengeDetail(client: Got, challengeId: number) {
    const challengeDetail = await client
        .get(`api/v1/challenges/${challengeId}`)
        .json<CtfdResponseChallengeDetail>();

    return challengeDetail;
}
async function fetchChallenges(client: Got) {
    const challenges = await client
        .get("api/v1/challenges")
        .json<CtfdResponseChallenges>();

    return challenges;
}

function createThreadMessage({
    challenge,
}: {
    challenge: CtfdResponseChallengeDetail;
}) {
    if (!challenge.success) return;

    const detail = challenge.data;

    const m = [];
    m.push(
        "**Description: **\n" +
            detail.description.replace(
                // attach > to the beginning of each line
                /^/gm,
                "> ",
            ),
    );

    if (detail.connection_info) {
        m.push("**Connection Info: **\n" + `\`${detail.connection_info}\``);
    }

    if (detail.files.length > 0) {
        m.push("**Attached Files Existes**");
    }

    return m.join("\n");
}

export default {
    data: new SlashCommandBuilder()
        .setName("init")
        .setDescription(
            "Fetch the challenges from the ctfd system and create a threads.",
        )
        .addStringOption((option) =>
            option
                .setRequired(true)
                .setName("host")
                .setDescription("ctfd host. like a `https://demo.ctfd.io`"),
        )
        .addStringOption((option) =>
            option
                .setRequired(true)
                .setName("token")
                .setDescription(
                    "An access token created with user privileges. Created from settings.`",
                ),
        )
        .addUserOption((option) =>
            option
                .setName("member1")
                .setDescription(
                    "Specifies members that are automatically added when a thread is created.",
                ),
        )
        .addUserOption((option) =>
            option
                .setName("member2")
                .setDescription(
                    "Specifies members that are automatically added when a thread is created.",
                ),
        )
        .addUserOption((option) =>
            option
                .setName("member3")
                .setDescription(
                    "Specifies members that are automatically added when a thread is created.",
                ),
        )
        .addUserOption((option) =>
            option
                .setName("member4")
                .setDescription(
                    "Specifies members that are automatically added when a thread is created.",
                ),
        )
        .addUserOption((option) =>
            option
                .setName("member5")
                .setDescription(
                    "Specifies members that are automatically added when a thread is created.",
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const host = interaction.options.getString("host", true);
        const token = interaction.options.getString("token", true);
        const members: User[] = [];
        {
            const m1 = interaction.options.getUser("member1");
            const m2 = interaction.options.getUser("member2");
            const m3 = interaction.options.getUser("member3");
            const m4 = interaction.options.getUser("member4");
            const m5 = interaction.options.getUser("member5");
            if (m1) members.push(m1);
            if (m2) members.push(m2);
            if (m3) members.push(m3);
            if (m4) members.push(m4);
            if (m5) members.push(m5);
        }

        interaction.deferReply();

        if (interaction.channel === null) {
            await interaction.editReply(
                "Please run this command in a channel.",
            );
            return;
        }
        if (interaction.channel.type !== ChannelType.GuildText) {
            await interaction.editReply(
                "Please run this command in a text channel.",
            );
            return;
        }

        try {
            const ctfdClient = ctfdCleint(host, token);
            const challenges = await fetchChallenges(ctfdClient);
            if (!challenges.success) {
                await interaction.followUp(
                    "Failed to fetch challenges. Invalid token?",
                );
                return;
            }
            console.log(challenges);

            for (const challenge of challenges.data) {
                const { category, name } = challenge;

                const thread = await interaction.channel.threads.create({
                    name: `${category} - ${name}`,
                });

                const detail = await fetchChallengeDetail(
                    ctfdClient,
                    challenge.id,
                );

                const message =
                    `${host}/challenges#${encodeURIComponent(name)}-${
                        challenge.id
                    }\n` + createThreadMessage({ challenge: detail });
                if (message) {
                    thread.send(message);
                }

                thread.members.add(interaction.user);
                for (const member of members) {
                    thread.members.add(member);
                }
                console.log(
                    "Created a thread: " + thread.name + " " + thread.id,
                    thread,
                );

                await wait(1000);
            }

            await interaction.followUp("Done!");
        } catch (error) {
            console.error(error);
            await interaction.followUp(
                "Failed to fetch challenges. Invalid host?",
            );
        }
    },
};
