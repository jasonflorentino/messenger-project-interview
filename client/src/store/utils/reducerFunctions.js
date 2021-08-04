export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
      unreadMessages: 1,
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      // Increment unreadMessages if the new message isn't yours
      if (convoCopy.otherUser.id === message.senderId) {
        convoCopy.unreadMessages++;
      }
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const newConvo = { ...convo };
      newConvo.id = message.conversationId;
      newConvo.messages.push(message);
      newConvo.latestMessageText = message.text;
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const updateMsgReadStatusInStore = (state, payload) => {
  const { ids, updatedMessages } = payload;
  const { conversationId } = ids;
  return state.map((convo) => {
    if (convo.id === conversationId) {
      // Make new copy of convo
      const convoCopy = { ...convo };
      // Update necessary messages into new array
      const updatedMessageLookup = makeMessageIdLookup(updatedMessages);
      convoCopy.messages = convoCopy.messages.map((message) => {
        const id = message.id;
        if (updatedMessageLookup[id]) {
          return updatedMessageLookup[id];
        } else {
          return message;
        }
      });
      // Update last read message ID if your messages were the ones that got read
      const updatedMessagesAreMine = convoCopy.otherUser.id !== updatedMessages[0].senderId;
      if (updatedMessagesAreMine) {
        const lastMessageIdx = updatedMessages.length - 1;
        convoCopy.lastReadMessageId = updatedMessages[lastMessageIdx]?.id;
      }
      // Reset unread message count
      if (!updatedMessagesAreMine) {
        convoCopy.unreadMessages = 0;
      }
      return convoCopy;
    } else {
      return convo;
    }
  })
}

function makeMessageIdLookup(messages) {
  const lookupTable = {};
  for (const msg of messages) {
    lookupTable[msg.id] = msg;
  }
  return lookupTable;
}