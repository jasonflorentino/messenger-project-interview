import React from "react";
import { Box, Avatar } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  avatar: {
    height: 18,
    width: 18,
    marginTop: 6
  },
}));

const Messages = (props) => {
  const { messages, otherUser, userId, lastReadMessageId } = props;
  const classes = useStyles();

  let readMarker = <Avatar alt={otherUser.username} src={otherUser.photoUrl} className={classes.avatar}></Avatar>;

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");
        const isLastRead = message.id === lastReadMessageId;

        return message.senderId === userId ? (
          <SenderBubble key={message.id} text={message.text} time={time} readMarker={isLastRead && readMarker} />
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
    </Box>
  );
};

export default Messages;
