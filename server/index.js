const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
// require("dotenv").config();
const cors = require("cors");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const {Server} = require("socket.io");

dotenv.config(); // this should be above, before the modules/files are imported then only it will get the variables

const connectDB = require("./config/db.js");
const Messages = require("./models/message.js");

const userRoutes = require("./routes/user.js");
const chatRoutes = require("./routes/chat.js");
const messageRoutes = require("./routes/message.js");
const {notFound, errorHandler} = require("./middlewares/error.js");
const authMiddleware = require("./middlewares/authMiddleware.js");
const createWebSocketServer = require("./services/webSocket.js");

connectDB();

const app = express();
const port = process.env.PORT || 5000;
const jwtSecretKey = process.env.JWT_SECRET_KEY;
// console.log(jwtSecretKey);

app.use("/uploads", express.static(__dirname + "/uploads")); //make upload dir to available to server
app.use(express.json());
app.use(cookieParser());
// app.use(cors()); //cross origin resource sharing
app.use(cors({credentials: true, origin: process.env.FRONTEND_URL}));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", authMiddleware, chatRoutes);
app.use("/api/v1/message", authMiddleware, messageRoutes);

app.use(notFound);
app.use(errorHandler);

// ========================Deployment===================

const __dirname1 = path.resolve(); //current working dir
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
  });
  console.log("hey");
}

// ==================================================

const server = app.listen(port, () => {
  console.log(`Server is up and running at: ${port}`.bgRed);
});
// console.log("server: ", server);

// ====================Socket.IO Server

// const io = require("socket.io")(server, {
// configure Socket.IO options directly during initialization
const io = new Server(server, {
  pingTimeout: 60000, //60 sec
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", socket => {
  console.log("Connected to socket.io");

  // create separate room for the user
  socket.on("setup", userData => {
    console.log(`UserId to create room for ${userData.name}: ${userData._id}`);
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", room => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", room => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", room => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", newMessageReceived => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }

    chat.users.forEach(user => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userData._id);
  });
});

// ====================WebSocketServer
// const wss = createWebSocketServer(server);
