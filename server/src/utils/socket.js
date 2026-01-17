import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their room`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};

export const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
