const http = require('http');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const authn = require('./authn');
const console = require('./console');
const knex = require('./database');
const path = require('path');

var io;

function socketAuthMW(socket, next) {
    const token = socket.handshake.auth.token;
    authn.verifyToken(token, (err, user) => {
        if (err) return next(new Error("Unauthorized"));

        socket.user = user;
        next();
    });
}

function initSocket(server) {
    io = new socketIo.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use(socketAuthMW);

    io.on("connection", (socket) => {
        console.log(`debug-User connected: ${socket.user.uuid}`);

        socket.on("subscribeChat", async (room) => {
            // room = conv_{uuid}
            const conversation = await knex("conversations")
                .where({ uuid: room.replace("conv_", ""), user_uuid: socket.user.uuid })
                .first();

            if (!conversation) {
                return;
            }

            socket.join(room);
        });

        socket.on("unsubscribeChat", (room) => {
            socket.leave(room);
        });
    });

    return io;
}

function listen(app, port) {
    let server;

    if (process.env.https === "true") {
        let httpsKeys = {
            key: process.env.HTTPS_KEY || path.join(__dirname, "../certs/key.pem"),
            cert: process.env.HTTPS_CERT || path.join(__dirname, "../certs/cert.pem"),
        }

        if(!fs.existsSync(httpsKeys.key)) {
            console.error("SSL key file at " + httpsKeys.key + " not found");
            return;
        }

        if(!fs.existsSync(httpsKeys.cert)) {
            console.error("SSL certificate file at " + httpsKeys.cert + " not found");
            return;
        }

        const options = {
            key: fs.readFileSync(process.env.HTTPS_KEY || path.join(__dirname, "../certs/key.pem")),
            cert: fs.readFileSync(process.env.HTTPS_CERT || path.join(__dirname, "../certs/cert.pem")),
        };
        
        server = https.createServer(options, app);
    } else {
        server = http.createServer(app);
    }

    initSocket(server);

    server.listen(port, () => {
        const protocol = process.env.https === "true" ? "https" : "http";
        console.success(`Server is running on ${protocol}://0.0.0.0:${port}...`);
    });

    return { server, io };
}

module.exports = { listen, get io() { return io; } };