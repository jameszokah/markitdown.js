import * as fs from "fs";
import * as ffmpeg from "fluent-ffmpeg";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./documentConverter.js";

export class VideoConverter extends DocumentConverter {
  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!mimeType.startsWith("video/")) {
      return null;
    }

    const metadata = await this.getVideoMetadata(localPath);
    const audioPath = await this.generateAudio(localPath);
    const audioBuffer = await fs.promises.readFile(audioPath);

    const textContent = `
# Video Analysis

- **File Name**: ${localPath.split("/").pop()}
- **Format**: ${metadata.format.format_name}
- **Duration**: ${metadata.format.duration} seconds
- **Bitrate**: ${metadata.format.bit_rate} bps
- **Resolution**: ${metadata.streams[0].width}x${metadata.streams[0].height}
- **Codec**: ${metadata.streams[0].codec_name}
- **Frame Rate**: ${metadata.streams[0].r_frame_rate}

## Thumbnail

![Video Thumbnail](data:image/jpeg;base64,${audioBuffer.toString("base64")})
    `.trim();

    await fs.promises.unlink(audioBuffer);

    return {
      title: "Video Analysis",
      textContent,
    };
  }

  /**
   * Retrieves metadata for a given video file.
   *
   * @param filePath - The path to the video file.
   * @returns A promise that resolves with the metadata of the video file.
   *          If an error occurs, the promise is rejected with the error.
   */
  private getVideoMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  private generateAudio(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const audioPath = `${filePath}_audio.wav`;
      ffmpeg
        .default(filePath)
        .withNoVideo()
        .output(audioPath)
        .on("end", () => resolve(audioPath))
        .on("error", (err) => reject(err))
        .run();
    });
  }
}
