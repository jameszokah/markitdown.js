export interface DocumentConverterResult {
  title: string | null;
  textContent: string;
}

export abstract class DocumentConverter {
  abstract convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null>;
}

