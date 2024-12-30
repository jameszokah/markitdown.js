import * as fs from "fs";
import * as cheerio from "cheerio";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./documentConverter.js";

export class HtmlConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (extension !== ".html" && extension !== ".htm") {
      return null;
    }

    const content = await fs.promises.readFile(localPath, "utf-8");
    const $ = cheerio.load(content);

    $("script").remove();
    $("style").remove();

    const title = $("title").text() || null;
    const textContent = $("body").text().trim();

    return {
      title,
      textContent,
    };
  }
}
