const express = require('express');
const fs = require('fs');
const path = require('path');
const logging = require('./modules/console');
const cors = require('cors');
const { server } = require('./modules/server');
const { getSocketInstance, addUserSocket, removeUserSocket } = require('./modules/socket_instance');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

logging.info("Starting server...");
logging.log("Loading routes...");

function loadRoutes(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relativePath = "." + fullPath.replace(__dirname, "").replace(/\\/g, "/");
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadRoutes(fullPath); // load routes in subdirectories
        } else if (file.endsWith('.js')) {
            // if its a valid route file, load it
            const route = require(fullPath);
            try {
                app.use(route);
                logging.log("Loaded route(s) from " + relativePath);
            } catch (error) {
                logging.error("Failed to load route(s) from " + relativePath + ": " + error);
            }
        }
    });
}

// load required routes before starting:
loadRoutes(path.join(__dirname, "routes"));

const srv = server(app);
srv.listen(port, (proto) => {
    logging.success("Server started on " + srv.proto + "://localhost:" + port);
});

const io = getSocketInstance();
if (!io) {
    logging.error("couldn't configure socket :(");
    process.exit(1);
}

io.on('connection', (socket) => {
    logging.info(`Socket.IO client connected: ${socket.userId}`);
    
    // add user socket mapping
    addUserSocket(socket.userId, socket.id);
    
    socket.on('disconnect', () => {
        logging.info(`Socket.IO client disconnected: ${socket.userId}`);
        // remove user socket mapping
        removeUserSocket(socket.userId, socket.id);
    });
});