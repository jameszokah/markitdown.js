import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import { DocumentConverter, DocumentConverterResult } from './documentConverter.js';

export class PdfConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (extension !== '.pdf') {
      return null;
    }

    const dataBuffer = await fs.promises.readFile(localPath);
    const data = await pdf.default(dataBuffer);

    return {
      title: data.info.Title || null,
      textContent: data.text,
    };
  }
}

