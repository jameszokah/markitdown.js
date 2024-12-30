import * as cheerio from "cheerio";
import * as fs from "fs";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./documentConverter.js";

export class WikipediaConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!localPath.includes("wikipedia.org/wiki/")) {
      return null;
    }

    try {
      const content = await fs.promises.readFile(localPath, "utf-8");
      const $ = cheerio.load(content);

      const title = $("#firstHeading").text().trim();
      let textContent = "";

      // Extract main content
      $("#mw-content-text > .mw-parser-output")
        .children()
        .each((_, element) => {
          const tagName = element.tagName.toLowerCase();
          if (
            ["p", "h2", "h3", "h4", "h5", "h6", "ul", "ol"].includes(tagName)
          ) {
            if (tagName.startsWith("h")) {
              textContent +=
                "#".repeat(parseInt(tagName[1])) +
                " " +
                $(element).text().trim() +
                "\n\n";
            } else if (tagName === "p") {
              textContent += $(element).text().trim() + "\n\n";
            } else if (tagName === "ul" || tagName === "ol") {
              $(element)
                .find("li")
                .each((_, li) => {
                  textContent += "- " + $(li).text().trim() + "\n";
                });
              textContent += "\n";
            }
          }
        });

      return {
        title,
        textContent: textContent.trim(),
      };
    } catch (error) {
      console.error("Error processing Wikipedia page:", error);
      return null;
    }
  }
}
