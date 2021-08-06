import React from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent, MessageCounter } from "../Sidebar";
import { withStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { connect } from "react-redux";

const styles = {
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
};

const Chat = (props) => {
  const { classes, conversation, setActiveChat } = props;
  const { otherUser, unreadMessages = 0 } = conversation;
  const { photoUrl, username, online } = otherUser;

  const handleClick = async (username) => {
    await setActiveChat(username);
  };

  return (
    <Box
      onClick={() => handleClick(username)}
      className={classes.root}
    >
      <BadgeAvatar
        photoUrl={photoUrl}
        username={username}
        online={online}
        sidebar={true}
      />
      <ChatContent 
        conversation={conversation} 
        isUnread={!!unreadMessages}
      />
      {!!unreadMessages && <MessageCounter count={unreadMessages} />}
    </Box>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (username) => {
      dispatch(setActiveChat(username));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Chat));