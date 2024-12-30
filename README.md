# MakeItDown.js

MakeItDown.js is an all-in-one JavaScript tool for converting various file formats to Markdown. It supports a wide range of file types, including text, HTML, PDF, DOCX, XLSX, images, audio, video, and more. The tool can be used both as a CLI application and as a library in your code.

## Features

- Convert text files to Markdown
- Convert HTML files to Markdown
- Convert PDF files to Markdown
- Convert DOCX files to Markdown
- Convert XLSX files to Markdown
- Convert YouTube videos to Markdown
- Convert Bing search results to Markdown
- Convert Wikipedia pages to Markdown
- Convert RSS feeds to Markdown
- Convert ZIP files to Markdown

## Installation

To install MakeItDown.js, you can use npm:

```sh
npx makeitdown "document.pdf"
```

or

```sh
npm install -g makeitdown

```

## Usage

### CLI

You can use the `makeitdown` command to convert files or URLs to Markdown. Here are some examples:

```sh
makeitdown "document.pdf"
makeitdown "https://example.com" -o output.md
makeitdown audio.mp3 --google-application-credentials credentials.json
```

### Options

- `-o, --output <file>`: Output file (default: stdout)
- `--google-application-credentials <file>`: Path to Google Cloud credentials JSON file
- `--no-color`: Disable color output
- `-h, --help`: Display help information
- `-v, --version`: Display version information

### Library

You can also use MakeItDown.js as a library in your code. Here is an example:

```typescript
import { MakeItDown } from "makeitdown";

const makeItDown = new MakeItDown();

async function convertFile() {
  const result = await makeItDown.convert("document.pdf");
  console.log(result.textContent);
}

convertFile();
```

## Roadmap

### Future Enhancements

- **Audio Converter**: Improve transcription accuracy and support more audio formats.
- **Image Converter**: Enhance image processing capabilities and support more image formats.
- **Video Converter**: Improve video analysis and support more video formats.
- **Additional Converters**: Add support for more file types and formats.
- **Performance Improvements**: Optimize the conversion process for better performance.
- **Error Handling**: Improve error handling and provide more informative error messages.
- **Documentation**: Enhance documentation with more examples and detailed explanations.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.

---

By James Zokah

---

For more information, please visit the [GitHub repository](https://github.com/jameszokah/makeitdown.js).
