const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Running");
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  console.log("socket_id", socket.id);

  socket.on("test_connection", (message) => {
    console.log("Received message:", message);
  });

  socket.on("callEndEvent", (message) => {
    console.log(message, "message");
    if (message === "end") {
      io.emit("callEndEvent", message); // Broadcast the "end" message to all connected clients
    }
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    console.log("userToCall", userToCall);
    console.log("from", from);
    console.log("name", name);
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
