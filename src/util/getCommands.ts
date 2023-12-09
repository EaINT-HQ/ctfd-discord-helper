import { Collection, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { Command, listCommandFiles } from "../util";

export async function getCommandsWithArray() {
    const commandFiles = listCommandFiles();
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    for (const commandPath of commandFiles) {
        const { default: command } = (await import(commandPath)) as {
            default: Command;
        };
        commands.push(command.data.toJSON());
    }

    return commands;
}

export async function getCommandsWithCollection() {
    const commandFiles = listCommandFiles();
    const commands = new Collection<string, Command>();

    for (const commandPath of commandFiles) {
        const { default: command } = (await import(commandPath)) as {
            default: Command;
        };
        commands.set(command.data.name, command);
    }

    return commands;
}
