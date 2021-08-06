import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  readMessageAction,
} from "./store/conversations";

const options = {
  auth: {
    // Initialize with auth token, if available
    "token": localStorage.getItem("messenger-token")
  }
}

const socket = io(process.env.REACT_APP_SERVER_URL, options);

socket.on("connect", () => {
  console.log("connected to server");
});
socket.on("add-online-user", (id) => {
  store.dispatch(addOnlineUser(id));
});
socket.on("remove-offline-user", (id) => {
  store.dispatch(removeOfflineUser(id));
});
socket.on("new-message", (data) => {
  store.dispatch(setNewMessage(data.message, data.sender));
});
socket.on("read-messages", (data) => {
  store.dispatch(readMessageAction(data.ids, data.updatedMessages));
});
socket.on("disconnect", (reason) => {
  console.log(`disconnected from server: ${reason}`)
});
socket.on("connect_error", (err) => {
  console.log(err.message);
})

export default socket;
