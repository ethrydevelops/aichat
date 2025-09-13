const { createServer } = require('node:http');
const { createServer: createSecureServer } = require('node:https');
const { Server } = require('socket.io');
const path = require("path");
const fs = require('fs');
const logging = require("./console.js");
const colors = require("colors");
const knex = require("./database.js");
const { setSocketInstance } = require("./socket_instance.js");

require("dotenv").config();

let proto;

const server = (app) => {
    let srv;

    if (process.env.HTTPS === "true") {
        if (!(process.env.HTTPS_KEY_PATH && process.env.HTTPS_CERT_PATH)) {
            logging.error("HTTPS_KEY_PATH and HTTPS_CERT_PATH must be populated with valid SSL certificate and private key.");
            throw new Error("HTTPS_KEY_PATH and HTTPS_CERT_PATH must be populated with valid SSL certificate and private key.");
        }

        const keyPath = path.resolve(__dirname, '..', process.env.HTTPS_KEY_PATH);
        const certPath = path.resolve(__dirname, '..', process.env.HTTPS_CERT_PATH);

        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            const sslOptions = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
            };
            srv = createSecureServer(sslOptions, app);
            logging.info("Using protocol: 🔒 HTTPS");

            proto = "https";
        } else {
            throw new Error(`HTTPS key or certificate file not found at ${keyPath}, ${certPath}`)
        }
    } else {
        srv = createServer(app);
        logging.warn("Using protocol: HTTP" + colors.red(" *insecure*"));
        logging.warn("Running without HTTPS is " + colors.bold("not") + " recommended as it exposes your users to security risks. API keys and login credentials may be leaked on public networks, etc.");
        logging.warn("SSL certificates are free with Let's Encrypt, please consider using one.");

        proto = "http";
    }

    // socket.io
    const io = new Server(srv, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
    
            const [sid, sessionToken] = token.split(".");
            
            if (!sid || !sessionToken) {
                return next(new Error('Authentication error: Invalid token format'));
            }
    
            const session = await knex("sessions")
                .where({ sid, session_token: sessionToken })
                .first();
    
            if (!session) {
                return next(new Error('Authentication error: Invalid token'));
            }
    
            socket.userId = session.account_id;
            socket.sessionId = session.sid;
            
            logging.info(`Socket.IO user authenticated: ${session.account_id}`);
            next();
        } catch (error) {
            logging.error(`Socket.IO authentication error: ${error.message}`);
            next(new Error('Authentication error'));
        }
    });

    setSocketInstance(io);

    return {
        listen: (port, callback) => srv.listen(port, callback),
        proto,
        io
    };
};

module.exports = { server };