import "dotenv/config";
import { REST, Routes } from "discord.js";
import { getCommandsWithArray } from "./util/getCommands";

const token = process.env.DISCORD_TOKEN!;
const clientID = process.env.DISCORD_CLIENT_ID!;

if (!token || !clientID) {
    console.log("token", token);
    console.log("clientID", clientID);
    throw new Error("Missing environment variables");
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        const commands = await getCommandsWithArray();
        console.log(
            "commands:",
            commands.map((command) => command.name)
        );

        await rest.put(Routes.applicationCommands(clientID), {
            body: commands,
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
