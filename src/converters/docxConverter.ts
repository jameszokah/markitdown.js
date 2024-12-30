import * as mammoth from 'mammoth';
import { DocumentConverter, DocumentConverterResult } from './documentConverter.js';

export class DocxConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (extension !== '.docx') {
      return null;
    }

    const result = await mammoth.extractRawText({ path: localPath });
    return {
      title: null,
      textContent: result.value,
    };
  }
}

