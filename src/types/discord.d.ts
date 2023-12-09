import { Collection } from "discord.js";
import { Command } from "../util";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>;
    }
}
