import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
    if (socket?.connected) return socket;

    const socketUrl = import.meta.env.MODE === "development"
        ? "http://localhost:4000"
        : import.meta.env.VITE_SOCKET_URL;

    socket = io(socketUrl, {
        query: { userId },
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if(socket) {
        socket.disconnect();
        socket = null;
    }
};