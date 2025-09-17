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
    ...console, // keep other console methods
    
    // custom formatted methods:
    log: (...message) => {
        console.log(colors.blue("log"), ...message, colors.gray("(" + getFormattedConsoleTime() + ")"));
    },
    error: (...message) => {
        console.log(colors.red("error"), ...message, colors.gray("(" + getFormattedConsoleTime() + ")"));
    },
    warn: (...message) => {
        console.log(colors.yellow("warning"), ...message, colors.gray("(" + getFormattedConsoleTime() + ")"));
    },
    info: (...message) => {
        console.log(colors.cyan("info"), ...message, colors.gray("(" + getFormattedConsoleTime() + ")"));
    },
    success: (...message) => {
        console.log(colors.green("success"), ...message, colors.gray("(" + getFormattedConsoleTime() + ")"));
    },
};