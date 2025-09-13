import { io } from "socket.io-client";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

let socket = null;

function initializeSocket() {
    const instanceUrl = cookies.get("gronk_instance_url");
    const authToken = cookies.get("gronk_tk");
    
    if (instanceUrl && authToken) {
        if (socket) {
            socket.disconnect();
        }
        
        socket = io(instanceUrl, {
            auth: {
                token: authToken
            }
        });
        
        socket.on("connect", () => {
            console.log("Socket connected successfully");
        });
        
        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }
    
    return socket;
}

initializeSocket();

export default socket;
export { initializeSocket };