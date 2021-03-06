import React from 'react'
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "0.1rem 0.5rem",
    borderRadius: "1rem",
    backgroundColor: "#3A8DFF",
    color: "#FFFFFF",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
}));

const MessageCounter = ({ count }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {count}
    </Box>
  )
}

export default MessageCounter;