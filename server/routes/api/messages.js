const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");
const { Op } = require("sequelize");

// Post new comment
// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      if (!(await Conversation.isOwnConversation(senderId, conversationId)))
        return res.sendStatus(403);
      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.isOnline(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

// Update a message readStatus to `true`
router.patch("/read", async (req, res, next) => {
  try { 
    if (!req.user) return res.sendStatus(401);

    const senderId = req.user.id;
    const { conversationId } = req.body;

    // Validate request
    if (!conversationId) {
      return res
        .status(400)
        .json({ error: "You must provide a message ID and conversation ID" });
    }
    if (!(await Conversation.isOwnConversation(senderId, conversationId)))
      return res.sendStatus(403);
    // Handle message update
    const updatedRows = await Message.update(
      { readStatus: true }, 
      {
        where: { 
          conversationId: conversationId,
          readStatus: false,
          [Op.not]: [{ senderId: senderId }]
        },
        returning: true,
      }
    );
    // Updated message objects will be second element in updatedRows
    return res.json({ updatedMessages: updatedRows[1] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
