import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { getCommandsWithCollection } from "./util/getCommands";

const token = process.env.DISCORD_TOKEN!;

if (!token) {
    console.log("token", token);
    throw new Error("Missing environment variables");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = await getCommandsWithCollection();

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

// ContextMenu/Message
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isMessageContextMenuCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        if (!command.executeMessageContextMenu) {
            return;
        }

        await command.executeMessageContextMenu(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        if (!command.executeAutocomplete) {
            return;
        }
        await command.executeAutocomplete(interaction);
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isSelectMenu()) return;

    const command = (() => {
        switch (interaction.customId) {
            case "select_search_by_recipe":
                return interaction.client.commands.get("unit");
            case "select_search_by_unit":
                return interaction.client.commands.get("recipe");
            default:
                return null;
        }
    })();

    if (!command) return;

    try {
        if (!command.executeSelectMenu) {
            return;
        }
        await command.executeSelectMenu(interaction);
    } catch (error) {
        console.error(error);
    }
});

client.login(token);
