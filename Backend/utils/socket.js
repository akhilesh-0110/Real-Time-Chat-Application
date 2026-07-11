import { Server } from "socket.io";

const userSocketMap = {};

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL],
        },
    });
     
    io.on("connection", (socket) => {
        console.log("A user connected to the server", socket.io)

        const userId = socket.handshake.query.userId;

        if(userId) userSocketMap[userId] = socket.id;

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.io);
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap))
        });    

        socket.on("callUser", ({ userToCall, offer, type }) => {
            const receiverSocketId = userSocketMap[userToCall];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("incomingCall", {
                    from: userId,
                    offer,
                    type,
                });
            }
        });

        socket.on("answerCall", ({ to, answer }) => {
            const callerSocketId = userSocketMap[to];
            if (callerSocketId) {
                io.to(callerSocketId).emit("callAccepted", {
                    answer,
                });
            }
        });

        socket.on("iceCandidate", ({ to, candidate }) => {
            const receiverSocketId = userSocketMap[to];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("sendIceCandidate", {
                    candidate,
                });
            }
        });

        socket.on("endCall", ({ to }) => {
            const receiverSocketId = userSocketMap[to];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("callEnded");
            }
        });
    });
}

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

export { io };