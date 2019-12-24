const path = require("path");
const os = require("os");
const chalk = require("chalk");
const { execSync } = require("child_process");

const icons = {
  freebsd: chalk.red("\uf30c "),
  windows: chalk.blue("\uf17a "),
  linux: chalk.yellow("\uf17c "),
  darwin: chalk.magenta("\uf179 "),
  unknown: "\uf059"
};

const platform = icons[process.platform] || icons["unknown"];

const getGitInfo = () => {
  try {
    const status = execSync("git status", { stdio: "pipe" }).toString();
    const changes = (status.match(/modified:/g) || []).length;
    const branch = status.match(/on branch ([^\n]+)/i)[1];
    return [chalk.red("\uf47f " + changes), chalk.yellow("\ue725 " + branch)];
  } catch (e) {
    return [];
  }
};

const getNPMInfo = () => {
  try {
    const { name, version } = require(path.resolve(
      process.cwd(),
      "package.json"
    ));
    return [
      `${chalk.cyan("\ue71e " + name)}`, // package name
      `${chalk.red("\uf487 " + version)}`, // package version
      `${chalk.green("\ue718 " + process.version)}` // node version
    ];
  } catch (error) {
    return [];
  }
};

module.exports = core => {
  const bar = () => {
    if (core.repl.isBusy) return;
    const { username } = os.userInfo();
    const time = new Date().toTimeString().slice(0, 8);
    let bar = [
      `${platform}${username}`, // user and os info
      chalk.yellow("\ue389 ") + time, // current time
      ...getGitInfo(), // git info
      ...getNPMInfo(), // npm info
      chalk.magenta(
        "\uf413 " +
          process
            .cwd()
            .split(path.sep)
            .slice(-3)
            .join(path.sep)
      ) // current path
    ];
    core.repl.preOutput = bar.join(" ");
    core.repl.clear();
    core.repl.preprint();
    core.repl.print();
  };
  bar();
  setInterval(bar, 1000);
};
