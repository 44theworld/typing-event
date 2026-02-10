const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const MAX_NAME = 10;
const MAX_TEXT = 50;

// ===== socket.io =====
io.on("connection", (socket) => {
  const room = socket.handshake.auth?.room;
  if (!room || !/^[A-Za-z0-9_-]+$/.test(room)) {
    socket.disconnect();
    return;
  }

  socket.join(room);

  socket.on("submit", ({ name, text }) => {
    if (
      typeof name !== "string" ||
      typeof text !== "string" ||
      name.length < 1 ||
      name.length > MAX_NAME ||
      text.length < 1 ||
      text.length > MAX_TEXT
    ) return;

    io.to(room).emit("message", {
      name,
      text,
      ts: Date.now(),
    });
  });
});

// ===== React static =====
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("listening on", PORT);
});
