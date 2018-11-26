const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const port = 8989;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let users = [];
let usernames = [];
let idCounter = 0;

let chatrooms = {
  lobby: {
    users: [],
    messages: []
  },
  series: {
    users: [],
    messages: []
  },
  games: {
    users: [],
    messages: []
  }
};

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
    console.log(data);
    const currentTime = new Date();
    const currentMinutes =
      currentTime.getMinutes() < 10
        ? "0" + currentTime.getMinutes()
        : currentTime.getMinutes();
    data.time = `${currentTime.getHours()}:${currentMinutes}`;
    data.id = idCounter++;
    io.emit("RECIEVE_MESSAGE", data);
  });

  socket.on("SEND_USERNAME", data => {
    chatrooms[data.name].users.push(data.user);
    const usersAndNewRoom = {
      users: chatrooms[data.name].users,
      name: data.name
    };
    io.emit("UPDATE_USERNAMES", usersAndNewRoom);
  });

  socket.on("CHANGE_ROOM", data => {
    console.log("change room data is ", data);
    chatrooms[data.newRoom].users.push(data.user);
    const usersAndNewRoom = {
      name: data.newRoom,
      users: chatrooms[data.newRoom].users
    };
    console.log(usersAndNewRoom);
    io.emit("UPDATE_USERNAMES", usersAndNewRoom);

    chatrooms[data.oldRoom].users = chatrooms[data.oldRoom].users.filter(
      user => {
        return user.id !== data.user.id;
      }
    );

    const usersAndOldRoom = {
      name: data.oldRoom,
      users: chatrooms[data.oldRoom].users
    };

    io.emit("UPDATE_USERNAMES", usersAndOldRoom);
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
