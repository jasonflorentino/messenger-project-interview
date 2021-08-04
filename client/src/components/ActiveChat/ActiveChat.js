import { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { connect } from "react-redux";
import { readMessages } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column"
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between"
  }
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user, readMessages } = props;
  const conversation = props.conversation || {};

  const handleReadMessages = async (messageIds = [], convoId) => {
    const ids = {
      messageIds: messageIds,
      conversationId: convoId
    }
    await readMessages(ids);
  }

  // Read new, unread messages since last update
  useEffect(() => {
    // Return if no messages or there are no messages to read
    if (!props.conversation?.messages) return;
    if (!props.conversation.unreadMessages) return;
    const { conversation, conversation: { messages } } = props;
    const messageIdsToUpdate = getMessagesIdsToUpdate(messages, user.id);
    if (!messageIdsToUpdate.length) return;
    handleReadMessages(messageIdsToUpdate, conversation.id);
    // eslint-disable-next-line
  }, [props.conversation]);

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
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    conversation:
      state.conversations &&
      state.conversations.find(
        (conversation) => conversation.otherUser.username === state.activeConversation
      )
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    readMessages: (ids) => {
      dispatch(readMessages(ids));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActiveChat);

/**
 * @param {[]} messages An array of messages
 * @param {number} userId ID of the current user
 * @returns An array of message IDs for which update read status
 */
function getMessagesIdsToUpdate(messages = [], userId) {
  if (!messages.length) return [];
  let i = messages.length - 1;
  let currMsg = messages[i];
  const messageIdsToUpdate = [];
  // While the latest message isn't yours
  while (i >= 0 && currMsg.senderId !== userId) {
    // Stop if we hit old messages
    if (currMsg.readStatus === true) break;
    messageIdsToUpdate.push(currMsg.id);
    currMsg = messages[--i];
  }
  return messageIdsToUpdate;
}