import Parser from 'rss-parser';
import { DocumentConverter, DocumentConverterResult } from './documentConverter.js';

export class RSSConverter extends DocumentConverter {
  private parser: Parser;

  constructor() {
    super();
    this.parser = new Parser();
  }

  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!mimeType.includes('rss') && !mimeType.includes('xml') && extension !== '.xml') {
      return null;
    }

    try {
      const content = await this.parser.parseURL(localPath);

      let textContent = `# ${content.title || 'RSS Feed'}\n\n`;

      if (content.description) {
        textContent += `${content.description}\n\n`;
      }

      content.items.forEach((item, index) => {
        textContent += `## ${index + 1}. ${item.title || 'Untitled'}\n\n`;
        
        if (item.pubDate) {
          textContent += `**Published:** ${new Date(item.pubDate).toLocaleString()}\n\n`;
        }

        if (item.link) {
          textContent += `**Link:** ${item.link}\n\n`;
        }

        if (item.content) {
          textContent += `${item.content}\n\n`;
        } else if (item.contentSnippet) {
          textContent += `${item.contentSnippet}\n\n`;
        }

        textContent += '---\n\n';
      });

      return {
        title: content.title || 'RSS Feed',
        textContent: textContent.trim(),
      };
    } catch (error) {
      console.error('Error processing RSS feed:', error);
      return null;
    }
  }
}

