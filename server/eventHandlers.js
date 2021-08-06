const onlineUsers = require("./onlineUsers");

// Event names
const GO_ONLINE = "go-online";
const NEW_MESSAGE = "new-message";
const READ_MESSAGES = "read-messages";
const LOGOUT = "logout";
const ADD_ONLINE_USER = "add-online-user";
const REMOVE_OFFLINE_USER = "remove-offline-user";
const DISCONNECT = "disconnect";

// Event handlers
module.exports = (socket) => {
  socket.on(GO_ONLINE, goOnline);
  socket.on(LOGOUT, logout);
  socket.on(NEW_MESSAGE, newMessage);
  socket.on(READ_MESSAGES, readMessages);
  socket.on(DISCONNECT, handleSocketDisconnect);

  function goOnline(userid) {
    onlineUsers.add(userid, socket.id);
    // send the user who just went online to everyone else who is already online
    socket.broadcast.emit(ADD_ONLINE_USER, userid);
  }

  function logout(id) {
    onlineUsers.remove(id, socket.id);
    // If user is no longer online, all sockets closed
    if (!onlineUsers.isOnline(id)) {
      socket.broadcast.emit(REMOVE_OFFLINE_USER, id);
    }
  }

  function newMessage(data) {
    const recipient = data.recipientId;
    const sender = data.message.senderId;
    // All socketIds for sender and recipient
    const sessions = [
      ...onlineUsers.getSocketsByUserId(recipient),
      ...onlineUsers.getSocketsByUserId(sender),
    ]
    // Emit directly to each socket
    for (const socketId of sessions) {
      socket.to(socketId).emit(NEW_MESSAGE, {
        message: data.message,
        sender: data.sender,
      });
    }
  }

  function readMessages(body) {
    socket.broadcast.emit(READ_MESSAGES, body);
  }

  // Ensure online status is updated if socket is 
  // closed without a logout event
  function handleSocketDisconnect(_reason) {
    const id = onlineUsers.getUserBySocket(socket.id);
    if (id && onlineUsers.isOnline(id)) {
      logout(id, socket.id);
    }
  }
}