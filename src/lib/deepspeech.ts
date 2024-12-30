import * as fs from "fs";
import * as deepspeech from "deepspeech";

export class DeepSpeechTranscriber {
  private model: deepspeech.Model;

  constructor(modelPath: string, scorerPath: string) {
    this.model = new deepspeech.Model(modelPath);
    this.model.enableExternalScorer(scorerPath);
    
    
  }

  /**
   * Transcribes an audio file.
   * @param audioFilePath - Path to the audio file (WAV format, 16kHz, mono).
   * @returns Transcribed text from the audio.
   */
  public transcribeAudio(audioFilePath: string): string {
    const buffer = fs.readFileSync(audioFilePath);
    // const audioData = this.bufferToFloat32Array(buffer);

    return this.model.stt(buffer);
  }

  /**
   * Converts WAV data to a Float32Array.
   * @param buffer - Buffer containing WAV data.
   * @returns Normalized Float32Array.
   */
  private bufferToFloat32Array(buffer: Buffer): Float32Array {
    const int16Array = new Int16Array(
      buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      )
    );
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768; // Normalize int16 values to [-1, 1]
    }

    return float32Array;
  }
}

// Example Usage
// const MODEL_PATH = "./deepspeech-0.9.3-models.pbmm";
// const SCORER_PATH = "./deepspeech-0.9.3-models.scorer";
// const AUDIO_FILE = "./audio_input.wav";
// const SAMPLE_RATE = 16000; // Ensure this matches the model's requirements

// try {
//   const transcriber = new DeepSpeechTranscriber(MODEL_PATH, SCORER_PATH);
//   const transcription = transcriber.transcribeAudio(AUDIO_FILE);

//   console.log("Transcription:", transcription);
// } catch (error) {
//   console.error("Error during transcription:", error);
// }
