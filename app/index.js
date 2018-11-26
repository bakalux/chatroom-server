const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const port = 8989;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

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

  /** Getting message, processsing date and sending it to the client */
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

  /** Getting username,  pushing it the right room,
   *  and giving updated users and the right room to the client*/
  socket.on("SEND_USERNAME", data => {
    chatrooms[data.name].users.push(data.user);
    const usersAndNewRoom = {
      users: chatrooms[data.name].users,
      name: data.name
    };
    io.emit("UPDATE_USERNAMES", usersAndNewRoom);
  });

  /**While changing room, removing user from the old room and moving him to the new one
   * and giving updated users to the client
   */
  socket.on("CHANGE_ROOM", data => {
    console.log("change room data is ", data);
    // new room to add user
    chatrooms[data.newRoom].users.push(data.user);
    const usersAndNewRoom = {
      name: data.newRoom,
      users: chatrooms[data.newRoom].users
    };
    console.log(usersAndNewRoom);
    io.emit("UPDATE_USERNAMES", usersAndNewRoom);

    //old room to remove user
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

  /**Removing user on disconnect from all rooms */
  socket.on("disconnect", () => {
    idToRemove = socket.id;
    console.log("id to remove ", idToRemove);
    for (name in chatrooms) {
      //checking every room for disconnected user
      chatrooms[name].users = chatrooms[name].users.filter(user => {
        return user.id !== idToRemove;
      });
      console.log(chatrooms[name].users);
      const usersAndRoom = {
        users: chatrooms[name].users,
        name: name
      };
      io.emit("UPDATE_USERNAMES", usersAndRoom);
    }
  });
});

server.listen(port, () => {
  console.log("Running server on 127.0.0.1:" + port);
});
