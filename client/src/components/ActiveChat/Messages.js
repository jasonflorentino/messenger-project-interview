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
  const { messages, otherUser, userId } = props;
  const classes = useStyles();

  let lastReadIndex = findLastReadMessage(messages, userId);
  let readMarker = <Avatar alt={otherUser.username} src={otherUser.photoUrl} className={classes.avatar}></Avatar>;

  return (
    <Box>
      {messages.map((message, i) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <SenderBubble key={message.id} text={message.text} time={time} readMarker={i === lastReadIndex && readMarker} />
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
    </Box>
  );
};

export default Messages;

function findLastReadMessage(messages = [], userId) {
  if (!messages.length) return -1;
  let i = messages.length - 1;
  let currMsg = messages[i];
  while (i >= 0) {
    // Go to last message you sent
    if (currMsg.senderId !== userId) {
      currMsg = messages[--i];
      continue;
    };
    // Stop if it's been read
    if (currMsg.readStatus === true) break;
    currMsg = messages[--i];
  }
  return i;
}
