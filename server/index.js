const express = require("express");
const path = require("path");
const fs = require("fs");
const console = require("./modules/console");

require("dotenv").config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(require("cors")());
app.use(express.json());

app.disable("x-powered-by");

// debug
console.info("Starting server at http://0.0.0.0:" + PORT + "..."); // TODO: https
console.log("Environment:", process.env.NODE_ENV || "development");

console.log("Loading routes...");

function loadRoutes(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relativePath = "." + fullPath.replace(__dirname, "").replace(/\\/g, "/");
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadRoutes(fullPath); // subdirectories
        } else if (file.endsWith('.js')) {
            const route = require(fullPath);
            try {
                app.use(route);
                console.log("Loaded route(s) from " + relativePath);
            } catch (error) {
                console.error("Failed to load route(s) from " + relativePath + ": " + error);
            }
        }
    });
}

loadRoutes(path.join(__dirname, "routes"));

// TODO: https, socket
app.listen(PORT, () => {
    console.success("Server is running on http://0.0.0.0:" + PORT + "...");
});
