import { io } from "socket.io-client";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const socket = io(import.meta.env.VITE_API_URL, {
    auth: { token: cookies.get("askllm_tk") ? cookies.get("askllm_tk") : "" }
});

export default socket;