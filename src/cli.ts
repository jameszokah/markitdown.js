#!/usr/bin/env node

import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import { MakeItDown } from "./index.js";

const displayLogo = () => {
  console.log(
    chalk.cyan(figlet.textSync("MakeItDown.js", { horizontalLayout: "full" }))
  );
  console.log(chalk.yellow("by James Zokah\n"));
};

const displayHelp = () => {
  displayLogo();
  console.log(chalk.white("Usage: makeitdown <source> [options]\n"));
  console.log(chalk.white("Options:"));
  console.log(
    chalk.green("  -o, --output <file>"),
    "Output file (default: stdout)"
  );
  console.log(
    chalk.green("  --google-application-credentials <file>"),
    "Path to Google Cloud credentials JSON file"
  );
  console.log(chalk.green("  --no-color"), "Disable color output");
  console.log(chalk.green("  -h, --help"), "Display help information");
  console.log(chalk.green("  -v, --version"), "Display version information\n");
  console.log(chalk.white("Examples:"));
  console.log(chalk.cyan("  makeitdown document.pdf"));
  console.log(chalk.cyan("  makeitdown https://example.com -o output.md"));
  console.log(
    chalk.cyan(
      "  makeitdown audio.mp3 --google-application-credentials credentials.json\n"
    )
  );
};

program
  .version("1.0.0")
  .description("Convert various file formats to markdown")
  .argument("[source]", "Source file or URL to convert")
  .option("-o, --output <file>", "Output file (default: stdout)")
  .option(
    "--google-application-credentials <file>",
    "Path to Google Cloud credentials JSON file"
  )
  .option("--no-color", "Disable color output")
  .action(async (source, options) => {
    if (!source) {
      displayHelp();
      process.exit(0);
    }

    displayLogo();

    const spinner = ora("Processing...").start();

    try {
      if (options.googleApplicationCredentials) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS =
          options.googleApplicationCredentials;
      }

      const makeItDown = new MakeItDown();
      const result = await makeItDown.convert(source);

      spinner.succeed("Conversion complete");

      const output = `${result.title ? `# ${result.title}\n\n` : ""}${
        result.textContent
      }`;

      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(chalk.green(`Output saved to ${options.output}`));
      } else {
        console.log(chalk.cyan("\n--- Converted Output ---\n"));
        console.log(output);
        console.log(chalk.cyan("\n--- End of Output ---\n"));
      }
    } catch (error: any) {
      spinner.fail("Conversion failed");
      console.error(chalk.red("Error: "), error.message);
      process.exit(1);
    }
  });

if (process.argv.includes("--no-color")) {
  chalk.level = 0;
}

if (process.argv.length === 2) {
  displayHelp();
  process.exit(0);
}

program.parse(process.argv);
