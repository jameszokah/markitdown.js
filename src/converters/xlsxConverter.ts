import * as fs from "fs";
import { parseOfficeAsync } from "officeparser";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./documentConverter.js";

export class XlsxConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (extension !== ".xlsx") {
      return null;
    }

    try {
      const content = await fs.promises.readFile(localPath);
      const xlsx = await parseOfficeAsync(content);

      let textContent = `# Excel Workbook\n\n
      
        ${xlsx}
      
      `;

      return {
        title: "Excel Workbook",
        textContent: textContent.trim(),
      };
    } catch (error) {
      console.error("Error processing XLSX file:", error);
      return null;
    }
  }

  private createMarkdownTable(data: any[][]): string {
    if (data.length === 0) {
      return "Empty sheet";
    }

    let table = "| " + data[0].join(" | ") + " |\n";
    table += "| " + data[0].map(() => "---").join(" | ") + " |\n";

    for (let i = 1; i < data.length; i++) {
      table += "| " + data[i].join(" | ") + " |\n";
    }

    return table;
  }
}
