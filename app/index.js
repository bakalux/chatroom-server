const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const port = 8989;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let users = [];
let usernames = [];

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

  socket.on("SEND_USERNAME", data => {
    users.push({ username: data.username, id: socket.id });
    usernames = users.map(user => {
      return user.username;
    });
    console.log(data.username);
    io.emit("UPDATE_USERNAMES", usernames);
  });

  socket.on("disconnect", () => {
    idToRemove = socket.id;
    console.log("id to remove ", idToRemove);
    users = users.filter(user => {
      return user.id !== idToRemove;
    });
    usernames = users.map(user => {
      return user.username;
    });
    console.log(usernames);
    io.emit("UPDATE_USERNAMES", usernames);

    // just like on the client side, we have a socket.on method that takes a callback function
  });
});

server.listen(port, () => {
  console.log("Running server on 127.0.0.1:" + port);
});
