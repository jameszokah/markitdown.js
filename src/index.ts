import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";
import * as cliProgress from "cli-progress";
import chalk from "chalk";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./converters/documentConverter.js";
import { PlainTextConverter } from "./converters/plainTextConverter.js";
import { HtmlConverter } from "./converters/htmlConverter.js";
import { PdfConverter } from "./converters/pdfConverter.js";
import { DocxConverter } from "./converters/docxConverter.js";
import { XlsxConverter } from "./converters/xlsxConverter.js";
import { ImageConverter } from "./converters/imageConverter.js";
import { AudioConverter } from "./converters/audioConverter.js";
import { VideoConverter } from "./converters/videoConverter.js";
import { YouTubeConverter } from "./converters/youtubeConverter.js";
import { BingSerpConverter } from "./converters/bingSerpConverter.js";
import { WikipediaConverter } from "./converters/wikipediaConverter.js";
import { PptxConverter } from "./converters/pptxConverter.js";
import { RSSConverter } from "./converters/rssConverter.js";
import { ZipConverter } from "./converters/zipConverter.js";

export class MakeItDown {
  private converters: DocumentConverter[];

  constructor() {
    this.converters = [
      new PlainTextConverter(),
      new HtmlConverter(),
      new PdfConverter(),
      new DocxConverter(),
      new XlsxConverter(),
      // new ImageConverter(),
      // new AudioConverter(),
      // new VideoConverter(),
      new YouTubeConverter(),
      new BingSerpConverter(),
      new WikipediaConverter(),
      new PptxConverter(),
      new RSSConverter(),
    ];
    // ZipConverter needs a reference to MakeItDown, so we add it last
    this.converters.push(new ZipConverter(this));
  }

  async convert(source: string): Promise<DocumentConverterResult> {
    if (source.startsWith("http://") || source.startsWith("https://")) {
      return this.convertUrl(source);
    } else {
      return this.convertLocal(source);
    }
  }

  private async convertLocal(path: string): Promise<DocumentConverterResult> {
    const ext = this.getFileExtension(path);
    const mimeType = mime.lookup(path) || "application/octet-stream";

    for (const converter of this.converters) {
      const result = await converter.convert(path, ext, mimeType);
      if (result) {
        return result;
      }
    }

    throw new Error(`Unsupported file type: ${ext}`);
  }

  private async convertUrl(url: string): Promise<DocumentConverterResult> {
    const response = await axios.get(url, {
      responseType: "stream",
      headers: { "User-Agent": "MakeItDown/1.0" },
    });

    const contentType = response.headers["content-type"];
    const contentLength = parseInt(response.headers["content-length"], 10);
    const ext = mime.extension(contentType) || "";

    const tempPath = path.join(process.cwd(), `temp_${Date.now()}.${ext}`);
    const writer = fs.createWriteStream(tempPath);

    const progressBar = new cliProgress.SingleBar({
      format: `Downloading [${chalk.cyan(
        "{bar}"
      )}] {percentage}% | ETA: {eta}s | {value}/{total} bytes`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });

    progressBar.start(contentLength, 0);

    response.data.on("data", (chunk: Buffer) => {
      writer.write(chunk);
      progressBar.increment(chunk.length);
    });

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
      response.data.on("end", () => {
        writer.end();
        progressBar.stop();
      });
    });

    try {
      return await this.convertLocal(tempPath);
    } finally {
      fs.unlinkSync(tempPath);
    }
  }

  private getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }
}

export { DocumentConverterResult } from "./converters/documentConverter.js";
