const SET_ACTIVE_CHAT = "SET_ACTIVE_CHAT";

export const setActiveChat = (conversationId) => {
  return {
    type: SET_ACTIVE_CHAT,
    conversationId
  };
};

const reducer = (state = "", action) => {
  switch (action.type) {
    case SET_ACTIVE_CHAT: {
      return action.conversationId;
    }
    default:
      return state;
  }
};

export default reducer;
