import * as fs from "fs";
import { OfficeParserConfig, parseOfficeAsync,  } from "officeparser";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./documentConverter.js";

export class PptxConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (extension !== ".pptx") {
      return null;
    }

    try {
      const content = await fs.promises.readFile(localPath);

      const config: OfficeParserConfig = {
        newlineDelimiter: " ", // Separate new lines with a space instead of the default \n.
        ignoreNotes: true, // Ignore notes while parsing presentation files like pptx or odp.
      };
      const pptx = await parseOfficeAsync(content);

      let textContent = `# PowerPoint Presentation\n\n

        ${pptx}

      `;

      return {
        title: "PowerPoint Presentation",
        textContent: textContent.trim(),
      };
    } catch (error) {
      console.error("Error processing PPTX file:", error);
      return null;
    }
  }
}
