import chalk from "chalk";

export const Info = (message: string) => {
    const date = new Date();

    process.stdout.write(
      `${chalk.underline(chalk.blueBright(`Info[${date.toUTCString()}]`))}: ${chalk.whiteBright(message)}\n`,
    );
  },
  Warning = (message: string) => {
    const date = new Date();

    process.stdout.write(
      `${chalk.underline(chalk.yellowBright(`Warning[${date.toUTCString()}]`))}: ${chalk.whiteBright(message)}\n`,
    );
  },
  ErrorMsg = (error: Error) => {
    const date = new Date();

    process.stdout.write(
      `${chalk.underline(chalk.redBright(`Error[${date.toUTCString()}]`))}: ${chalk.whiteBright(error.message)}\n`,
    );
    process.stdout.write(`${error.stack}\n`);
  };
