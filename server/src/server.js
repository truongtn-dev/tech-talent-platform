import "./config/env.js"; // ← PHẢI ĐỨNG ĐẦU
import connectDB from "./config/db.js";
import app from "./app.js";

import http from "http";
import { initSocket } from "./utils/socket.js";

connectDB();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
