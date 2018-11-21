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
  console.log("user connected!");

  socket.on("change color", color => {
    // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
    // we make use of the socket.emit method again with the argument given to use from the callback function above
    console.log("color changed to: ", color);
    io.sockets.emit("change color", color);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // just like on the client side, we have a socket.on method that takes a callback function
  });
});

server.listen(port, () => {
  console.log("Running server on 127.0.0.1:" + port);
});
