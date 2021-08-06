import { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { useDispatch, useSelector } from "react-redux";
import { readMessages } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column",
    height: "100vh",
    width: "50%"
  },
  chatContainer: {
    paddingLeft: 41,
    paddingRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between",
    overflow: "auto",
  }
}));

const ActiveChat = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const conversation = useSelector((state) => {
    const { conversations, activeConversation } = state;
    const conversation = conversations && conversations.find(
      (convo) => convo.otherUser.username === activeConversation
    )
    return conversation || {};
  });

  const handleReadMessages = (convoId) => {
    const ids = {
      conversationId: convoId
    }
    dispatch(readMessages(ids));
  }

  // Read unread messages since last update
  useEffect(() => {
    // Return if no messages or there are no messages to read
    if (!conversation?.messages) return;
    if (!conversation.unreadMessages) return;
    handleReadMessages(conversation.id);
    // eslint-disable-next-line
  }, [conversation]);

  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              messages={conversation.messages}
              otherUser={conversation.otherUser}
              lastReadMessageId={conversation.lastReadMessageId}
              userId={user.id}
            />
          </Box>
          <Input
            otherUser={conversation.otherUser}
            conversationId={conversation.id}
            user={user}
          />
        </>
      )}
    </Box>
  );
};

export default ActiveChat;