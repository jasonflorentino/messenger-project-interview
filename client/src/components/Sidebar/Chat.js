import React, { Component } from "react";
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

class Chat extends Component {
  handleClick = async (conversation) => {
    await this.props.setActiveChat(conversation.id);
  };

  render() {
    const { classes, conversation } = this.props;
    const otherUser = conversation.otherUser;

    const unreadMessages = countUnreadMessages(conversation.messages, this.props.user.id);
    console.log("conversation", this.props.conversation)

    return (
      <Box
        onClick={() => this.handleClick(conversation)}
        className={classes.root}
      >
        <BadgeAvatar
          photoUrl={otherUser.photoUrl}
          username={otherUser.username}
          online={otherUser.online}
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
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Chat));

/**
 * Given and array of messages sorted from oldest to newest, 
 * and your `userId`, returns the number of messages that 
 * aren't yours and are unread since the last message you sent.
 * @param {[]} messages 
 * @param {number} userId 
 * @returns The number of unread messages since your last message
 */
function countUnreadMessages(messages = [], userId) {
  if (!messages.length) return 0;
  let i = messages.length - 1;
  let curr = messages[i];
  let unread = 0;

  // While there are still messages and
  // those messages aren't yours
  while (i >= 0 && curr.senderId !== userId) {
    if (curr.readStatus === false) unread++;
    i--;
    curr = messages[i];
  }

  return unread;
}