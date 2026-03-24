import { io } from "socket.io-client";

// Use environment variables for the deployed backend URL, stripping /api if it exists
const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const SOCKET_URL = apiUrl.replace(/\/api\/?$/, '');

export const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true
});