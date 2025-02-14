import { io } from "socket.io-client";

const SOCKET_URL = "https://taskmanagement-backend-uxtd.onrender.com";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});