import * as fs from "node:fs";
import * as path from "node:path";
import * as https from "node:https";

import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
} from "discord.js";
import { ExifTool } from "exiftool-vendored";

function fetchRemoteURLandReturnPath(url: string): Promise<string> {
    const tempDir = fs.mkdtempSync("temp-");
    const tmpFilename = url.replace(/.*\//, "");

    const filePath = path.join(tempDir, tmpFilename);
    const file = fs.createWriteStream(filePath);
    return new Promise((resolve, reject) => {
        https
            .get(url, (response: any) => {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    resolve(filePath);
                });
            })
            .on("error", (err: any) => {
                fs.unlink(filePath, () => {});
                reject(err.message);
            });
    });
}

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Inspect with ExifTool")
        .setType(ApplicationCommandType.Message),
    async executeMessageContextMenu(
        interaction: MessageContextMenuCommandInteraction
    ) {
        const { attachments } = interaction.targetMessage;
        if (attachments.size === 0) {
            await interaction.reply({
                content: "No attachments found in this message.",
                ephemeral: true,
            });
            return;
        }
        const attachment = attachments.first();
        if (!attachment) {
            await interaction.reply({
                content: "No attachments found in this message.",
                ephemeral: true,
            });
            return;
        }

        interaction.deferReply();

        const exiftool = new ExifTool();
        const v = await exiftool.version();

        // TODO: たぶんexitしてないからメモリリークしてる

        const filePath = await fetchRemoteURLandReturnPath(attachment.url);
        const exifResult = await exiftool.read(filePath);

        // remove temp file dir
        fs.rmdirSync(path.dirname(filePath), { recursive: true });

        // 役に立たないやつを消す
        delete exifResult.errors;
        delete exifResult.SourceFile;
        delete exifResult.FileName;
        delete exifResult.Directory;
        delete exifResult.FileModifyDate;
        delete exifResult.FileAccessDate;
        // @ts-ignore
        delete exifResult["FileCreateDate"];
        delete exifResult.FilePermissions;

        // 無駄に行を取るやつを消す
        const json = JSON.stringify(exifResult, null, 2);
        const data = JSON.parse(json);
        Object.keys(data).forEach((key) => {
            const v = data[key];
            if (
                (v._ctor === "ExifDateTime" ||
                    v._ctor === "ExifDate" ||
                    v._ctor === "ExifTime" ||
                    v._ctor === "BinaryField") &&
                "rawValue" in v
            ) {
                data[key] = v.rawValue;
            }
        });

        await interaction.followUp({
            files: [
                {
                    name: "exif.json",
                    attachment: Buffer.from(JSON.stringify(data, null, 2)),
                },
            ],
        });
    },
};
