import * as fs from 'fs';
import { DocumentConverter, DocumentConverterResult } from './documentConverter.js';

export class PlainTextConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!mimeType.startsWith('text/')) {
      return null;
    }

    const content = await fs.promises.readFile(localPath, 'utf-8');
    return {
      title: null,
      textContent: content,
    };
  }
}

