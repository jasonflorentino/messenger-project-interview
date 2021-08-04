const onlineUsers = require("./onlineUsers");

// Event names
const GO_ONLINE = "go-online";
const NEW_MESSAGE = "new-message";
const READ_MESSAGES = "read-messages";
const LOGOUT = "logout";
const ADD_ONLINE_USER = "add-online-user";
const REMOVE_OFFLINE_USER = "remove-offline-user";

// Event handlers
module.exports = (socket) => {
  socket.on(GO_ONLINE, goOnline);
  socket.on(LOGOUT, logout);
  socket.on(NEW_MESSAGE, newMessage);
  socket.on(READ_MESSAGES, readMessages);

  function goOnline(id) {
    if (!onlineUsers.includes(id)) {
      onlineUsers.add(id);
    }
    // send the user who just went online to everyone else who is already online
    socket.broadcast.emit(ADD_ONLINE_USER, id);
  }

  function logout(id) {
    if (onlineUsers.includes(id)) {
      onlineUsers.remove(id);
      socket.broadcast.emit(REMOVE_OFFLINE_USER, id);
    }
  }

  function newMessage(data) {
    socket.broadcast.emit(NEW_MESSAGE, {
      message: data.message,
      sender: data.sender,
    });
  }

  function readMessages(body) {
    socket.broadcast.emit(READ_MESSAGES, body);
  }
}