declare module "music-metadata" {
  export interface IAudioMetadata {
    // Add necessary properties here
    format: {
      container: string;
      duration?: number;
      bitrate?: number;
      sampleRate?: number;
      numberOfChannels?: number;
    };
    common: {
      title?: string;
      artist?: string;
      album?: string;
      year?: string;
      genre?: string[];
    };
  }

  export function parseFile(path: string): Promise<IAudioMetadata>;
}

declare module "peek-readable" {
  import { Readable as NodeReadableStream } from "stream";
  export type AnyWebByteStream = NodeReadableStream;
}
