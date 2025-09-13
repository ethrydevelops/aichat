const colors = require("colors");

var lastLogDate = new Date(0);

function getFormattedConsoleTime() {
    let currentDate = new Date();
    let time = currentDate.toLocaleTimeString();

    // check if date has changed
    if (currentDate.toLocaleDateString() != lastLogDate.toLocaleDateString()) {
        time = currentDate.toLocaleString();
        lastLogDate = currentDate; // update the cached date
    }

    return time;
}

module.exports = {
    log: (message) => {
        console.log(colors.blue("LOG ") + message + colors.gray(" " + getFormattedConsoleTime()));
    },
    error: (message) => {
        console.log(colors.red("ERROR ") + message + colors.gray(" " + getFormattedConsoleTime()));
    },
    warn: (message) => {
        console.log(colors.yellow("WARNING ") + message + colors.gray(" " + getFormattedConsoleTime()));
    },
    info: (message) => {
        console.log(colors.cyan("INFO ") + message + colors.gray(" " + getFormattedConsoleTime()));
    },
    success: (message) => {
        console.log(colors.green("YAY ") + message + colors.gray(" " + getFormattedConsoleTime()));
    },
};