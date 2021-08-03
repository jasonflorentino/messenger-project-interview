import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  readMessageAction,
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    // Add unreadMessages property to each conversation
    data.forEach((conversation) => {
      const { messages, otherUser } = conversation;
      // Count unread messages when we first get the conversations
      conversation.unreadMessages = countUnreadMessages(messages, otherUser.id);
    })
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

/**
 * Given and array of messages sorted from oldest to newest, 
 * and the `otherUserId`, returns the number of messages that 
 * aren't yours and are unread since the last message you sent.
 * @param {[]} messages 
 * @param {number} otherUserId 
 * @returns The number of unread messages since your last message
 */
function countUnreadMessages(messages = [], otherUserId) {
  if (!messages.length) return 0;
  let i = messages.length - 1;
  let curr = messages[i];
  let unread = 0;
  // While there are still messages and
  // those messages aren't yours
  while (i >= 0 && curr.senderId === otherUserId) {
    if (curr.readStatus === false) unread++;
    curr = messages[--i];
  }
  return unread;
}

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);
    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

// READ MESSAGES

const readMessagesToServer = async (body) => {
  const { data } = await axios.put("/api/messages/read", body);
  return data?.updatedRows;
};

const emitReadMessages = (body) => {
  socket.emit("read-messages", body);
};

export const readMessages = (body) => async (dispatch) => {
  try {
    const rows = await readMessagesToServer(body);
    // rows will be an array of the number of rows updated in the DB
    if (rows && rows[0] !== 0) {
      dispatch(readMessageAction(body, rows[0]))
      emitReadMessages(body);
    }
  } catch (error) {
    console.error(error);
  }
}

// SEARCH USERS

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
