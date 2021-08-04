const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
// TODO: for scalability, implement lazy loading
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id"],
      order: [[ Message, "createdAt", "ASC" ]],
      include: [
        { model: Message, order: [["createdAt", "ASC"]] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();
      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      const { messages, otherUser } = convoJSON;

      // set property for online status of the other user
      if (onlineUsers.includes(otherUser.id)) {
        otherUser.online = true;
      } else {
        otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      const lastIdx = messages.length - 1;
      convoJSON.latestMessageText = messages[lastIdx].text;
      convoJSON.lastReadMessageId = findLastReadMessage(messages, userId);
      convoJSON.unreadMessages = await Message.count({
        where: {
          conversationId: convoJSON.id,
          senderId: otherUser.id,
          readStatus: false
        }
      })

      conversations[i] = convoJSON;
    }

    conversations.sort(conversationSorter);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

/**
 * Sorting function for an array of conversations
 * each with its own `messages` array.
 * @returns Descending order from `createdAt` date of the last message in the messages array
 */
function conversationSorter(a, b) {
  if (!assertConvoWithMessages(a) || !assertConvoWithMessages(b)) return 0;
  lastIdxA = a.messages.length - 1;
  lastIdxB = b.messages.length - 1;
  lastMsgA = a.messages[lastIdxA];
  lastMsgB = b.messages[lastIdxB];
  return new Date(lastMsgB?.createdAt) - new Date(lastMsgA?.createdAt);
}

function assertConvoWithMessages(conversation) {
  return Array.isArray(conversation.messages);
}

/**
 * Takes an array of messages and finds the message 
 * that the other user last read
 * @param {[]} messages 
 * @param {number} userId 
 * @returns {number} The ID of the message that the other user last read
 */
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
  return currMsg?.id || 0;
}