import AdmZip from "adm-zip";
import * as path from "path";
import * as mime from "mime-types";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./documentConverter.js";
import { MakeItDown } from "../index.js";
import * as fs from "fs";

export class ZipConverter extends DocumentConverter {
  private makeItDown: MakeItDown;

  constructor(makeItDown: MakeItDown) {
    super();
    this.makeItDown = makeItDown;
  }

  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (extension !== ".zip") {
      return null;
    }

    try {
      const zip = new AdmZip(localPath);
      const zipEntries = zip.getEntries();

      let textContent = "# ZIP File Contents\n\n";

      for (const entry of zipEntries) {
        if (entry.isDirectory) {
          textContent += `## Directory: ${entry.entryName}\n\n`;
        } else {
          const tempPath = path.join(
            process.cwd(),
            `temp_${Date.now()}_${entry.name}`
          );
          zip.extractEntryTo(entry, path.dirname(tempPath), false, true);

          try {
            const entryMimeType =
              mime.lookup(entry.name) || "application/octet-stream";
            const result = await this.makeItDown.convert(tempPath);

            textContent += `## File: ${entry.name}\n\n`;
            textContent += `Size: ${entry.header.size} bytes\n`;
            textContent += `Last Modified: ${entry.header.time.toLocaleString()}\n\n`;
            textContent += result.textContent + "\n\n";
          } catch (error) {
            console.error(`Error processing ${entry.name}:`, error);
            textContent += `Error processing ${entry.name}\n\n`;
          } finally {
            await fs.promises.unlink(tempPath);
          }
        }
      }

      return {
        title: `ZIP: ${path.basename(localPath)}`,
        textContent: textContent.trim(),
      };
    } catch (error) {
      console.error("Error processing ZIP file:", error);
      return null;
    }
  }
}
