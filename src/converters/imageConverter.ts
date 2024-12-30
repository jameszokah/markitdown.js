import * as sharp from 'sharp';
import { DocumentConverter, DocumentConverterResult } from './documentConverter.js';

export class ImageConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!mimeType.startsWith('image/')) {
      return null;
    }

    const image = sharp.default(localPath);
    const metadata = await image.metadata();

    const resizedBuffer = await image
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const base64Image = resizedBuffer.toString('base64');

    const textContent = `
# Image Information

- **File Name**: ${localPath.split('/').pop()}
- **Format**: ${metadata.format}
- **Width**: ${metadata.width}px
- **Height**: ${metadata.height}px
- **Color Space**: ${metadata.space}

![Resized Image](data:image/${metadata.format};base64,${base64Image})
    `.trim();

    return {
      title: 'Image Analysis',
      textContent,
    };
  }
}

