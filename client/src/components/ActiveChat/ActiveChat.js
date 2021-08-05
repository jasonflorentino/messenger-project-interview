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

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user, readMessages } = props;
  const conversation = props.conversation || {};

  const handleReadMessages = async (convoId) => {
    const ids = {
      conversationId: convoId
    }
    await readMessages(ids);
  }

  // Read unread messages since last update
  useEffect(() => {
    // Return if no messages or there are no messages to read
    if (!props.conversation?.messages) return;
    if (!props.conversation.unreadMessages) return;
    const { conversation } = props;
    handleReadMessages(conversation.id);
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