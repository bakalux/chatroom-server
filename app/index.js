const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const port = 8989;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

io.on("connection", socket => {
  console.log(socket.id);

  socket.on("SEND_MESSAGE", data => {
    io.emit("RECIEVE_MESSAGE", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // just like on the client side, we have a socket.on method that takes a callback function
  });
});

server.listen(port, () => {
  console.log("Running server on 127.0.0.1:" + port);
});
