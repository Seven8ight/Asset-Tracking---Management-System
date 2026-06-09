import chalk from "chalk";

const date = new Date();

export const Info = (message: string) => {
    process.stdout.write(
      `${chalk.underline(chalk.blueBright(`Info[${date.toUTCString()}]`))}: ${chalk.whiteBright(message)}\n`,
    );
  },
  Warning = (message: string) => {
    process.stdout.write(
      `${chalk.underline(chalk.yellowBright(`Warning[${date.toUTCString()}]`))}: ${chalk.whiteBright(message)}\n`,
    );
  },
  ErrorMsg = (error: Error) => {
    process.stdout.write(
      `${chalk.underline(chalk.redBright(`Error[${date.toUTCString()}]`))}: ${chalk.whiteBright(error.message)}\n`,
    );
    process.stdout.write(`${error.stack}\n`);
  };
