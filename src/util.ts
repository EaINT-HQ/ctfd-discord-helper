import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "url";
import {
    AutocompleteInteraction,
    CacheType,
    ChatInputCommandInteraction,
    MessageContextMenuCommandInteraction,
    SelectMenuInteraction,
    SlashCommandBuilder,
} from "discord.js";

export type Command = {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
    executeAutocomplete?(
        interaction: AutocompleteInteraction<CacheType>
    ): Promise<void>;
    executeSelectMenu?(
        interaction: SelectMenuInteraction<CacheType>
    ): Promise<void>;
    executeMessageContextMenu?(
        interaction: MessageContextMenuCommandInteraction
    ): Promise<void>;
};

export function listCommandFiles() {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const commandsPath = path.join(dirname, "commands");
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));

    return commandFiles
        .map((file) => path.join(commandsPath, file))
        .map((filepath) => pathToFileURL(filepath).href);
}
