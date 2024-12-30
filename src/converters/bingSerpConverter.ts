import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { DocumentConverter, DocumentConverterResult } from './documentConverter.js';

export class BingSerpConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!localPath.includes('bing.com/search?q=')) {
      return null;
    }

    try {
      const content = await fs.promises.readFile(localPath, 'utf-8');
      const $ = cheerio.load(content);

      const query = $('input[name="q"]').val() as string;
      const results: string[] = [];

      $('.b_algo').each((_, element) => {
        const title = $(element).find('h2').text().trim();
        const url = $(element).find('cite').text().trim();
        const snippet = $(element).find('.b_caption p').text().trim();

        results.push(`
### ${title}
**URL:** ${url}

${snippet}
        `.trim());
      });

      const textContent = `
# Bing Search Results for "${query}"

${results.join('\n\n')}
      `.trim();

      return {
        title: `Bing Search: ${query}`,
        textContent,
      };
    } catch (error) {
      console.error('Error processing Bing SERP:', error);
      return null;
    }
  }
}

