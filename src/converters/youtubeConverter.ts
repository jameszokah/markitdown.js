import * as ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';
import { DocumentConverter, DocumentConverterResult } from './documentConverter.js';

export class YouTubeConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!localPath.includes('youtube.com/watch?v=') && !localPath.includes('youtu.be/')) {
      return null;
    }

    try {
      const info = await ytdl.getInfo(localPath);
      const videoDetails = info.videoDetails;
      const transcript = await this.getTranscript(videoDetails.videoId);

      const textContent = `
# ${videoDetails.title}

## Video Information
- **Channel:** ${videoDetails.author.name}
- **Published:** ${new Date(Number(videoDetails.publishDate)).toLocaleDateString()}
- **Views:** ${videoDetails.viewCount}
- **Length:** ${this.formatDuration(Number(videoDetails.lengthSeconds))}

## Description
${videoDetails.description}

## Tags
${videoDetails.keywords ? videoDetails.keywords.join(', ') : 'No tags available'}

## Transcript
${transcript}
      `.trim();

      return {
        title: videoDetails.title,
        textContent,
      };
    } catch (error) {
      console.error('Error processing YouTube video:', error);
      return null;
    }
  }

  private async getTranscript(videoId: string): Promise<string> {
    try {
      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
      return transcriptArray.map(entry => entry.text).join(' ');
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return 'Transcript not available.';
    }
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [hours, minutes, remainingSeconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  }
}

