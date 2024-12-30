import * as fs from "fs";
import * as mm from "music-metadata";
import ffmpeg from "fluent-ffmpeg";
import { SpeechClient, protos } from "@google-cloud/speech";
import { whisper } from "whisper-node-ts";
import {
  DocumentConverter,
  DocumentConverterResult,
} from "./documentConverter.js";
import path from "path";
import { DeepSpeechTranscriber } from "../lib/deepspeech.js";

export class AudioConverter extends DocumentConverter {
  private speechClient: SpeechClient | null;

  constructor() {
    super();
    this.speechClient = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? new SpeechClient()
      : null;
  }

  async convert(
    localPath: string,
    extension: string,
    mimeType: string
  ): Promise<DocumentConverterResult | null> {
    if (!mimeType.startsWith("audio/")) {
      return null;
    }

    const metadata = await mm.parseFile(localPath);
    const AUDIO_FILE = await this.convertToWav(localPath);

    try {
      let transcription: string;
      if (this.speechClient) {
        transcription = await this.transcribeAudioWithGoogle(AUDIO_FILE);
      } else {
        transcription = await this.transcribeAudioWithWhisper(AUDIO_FILE);
        // if (!transcription) {
        //   const MODEL_PATH = path.resolve(
        //     process.cwd(),
        //     "../../../../deepspeech-0.9.3-models.pbmm"
        //   );
        //   const SCORER_PATH = path.resolve(
        //     process.cwd(),
        //     "../../../../deepspeech-0.9.3-models.scorer"
        //   );

        //   const transcriber = new DeepSpeechTranscriber(
        //     MODEL_PATH,
        //     SCORER_PATH
        //   );
        //   transcription = transcriber.transcribeAudio(AUDIO_FILE);

        //   console.log("Transcription:", transcription);
        // }
        // console.log("LOGGING: " + transcription);
      }
      const textContent = this.formatOutput(localPath, metadata, transcription);

      return {
        title: "Audio Analysis",
        textContent,
      };
    } finally {
      await fs.promises.unlink(AUDIO_FILE);
    }
  }

  private async convertToWav(inputPath: string): Promise<string> {
    const outputPath = `${inputPath.split(".")[0]}-${Date.now()}.wav`;
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .on("error", reject)
        .on("end", () => resolve(outputPath))
        .run();
    });
  }

  private async transcribeAudioWithGoogle(filePath: string): Promise<string> {
    if (!this.speechClient) {
      throw new Error("Google Speech client is not initialized");
    }

    const file = await fs.promises.readFile(filePath);
    const audioBytes = file.toString("base64");

    const audio = {
      content: audioBytes,
    };
    const config = {
      encoding:
        protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      sampleRateHertz: 16000,
      languageCode: "en-US",
    };
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await this.speechClient.recognize(request);
    if (!response.results) {
      throw new Error("No transcription results found");
    }
    return response.results
      .map((result) =>
        result.alternatives ? result.alternatives[0].transcript : ""
      )
      .join("\n");
  }

  private async transcribeAudioWithWhisper(filePath: string): Promise<string> {
    try {
      let modelPath = path.resolve(
        process.cwd(),
        "../../../../dist/ggml-base.en.bin"
      );

      if (!path.parse(modelPath)) {
        modelPath = path.resolve(process.cwd(), "/dist/ggml-base.en.bin");
      }

      console.log(modelPath);

      const options = {
        // modelName: "base.en",
        modelPath: modelPath,
      };
      const result = await whisper(filePath, options);
      return result?.map((line) => line.speech).join("\n");
    } catch (error) {
      console.error("Error transcribing with Whisper:", error);
      return "Transcription failed with Whisper.";
    }
  }

  private formatOutput(
    filePath: string,
    metadata: mm.IAudioMetadata,
    transcription: string
  ): string {
    const fileName = filePath.split("/").pop();
    const duration = metadata.format.duration
      ? `${metadata.format.duration.toFixed(2)} seconds`
      : "Unknown";
    const bitrate = metadata.format.bitrate
      ? `${Math.round(metadata.format.bitrate / 1000)} kbps`
      : "Unknown";
    const sampleRate = metadata.format.sampleRate
      ? `${metadata.format.sampleRate} Hz`
      : "Unknown";
    const channels = metadata.format.numberOfChannels || "Unknown";

    return `
# Audio Analysis

- **File Name**: ${fileName}
- **Format**: ${metadata.format.container}
- **Duration**: ${duration}
- **Bitrate**: ${bitrate}
- **Sample Rate**: ${sampleRate}
- **Channels**: ${channels}

## Metadata

${this.formatTags(metadata.common)}

## Transcription

${transcription || "No transcription available."}
    `.trim();
  }

  private formatTags(tags: mm.ICommonTagsResult): string {
    const relevantTags: (keyof mm.ICommonTagsResult)[] = [
      "title",
      "artist",
      "album",
      "year",
      "genre",
    ];
    return relevantTags
      .filter((tag) => tags[tag])
      .map(
        (tag) =>
          `- **${tag.charAt(0).toUpperCase() + tag.slice(1)}**: ${tags[tag]}`
      )
      .join("\n");
  }
}
