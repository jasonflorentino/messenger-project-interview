const { Op } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id],
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id],
      },
    },
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

/**
 * Assert a given userID is part of a given conversation
 * @param {*} userId A userId to check
 * @param {*} conversationId A conversation to check against
 * @returns Promise that resolves `true` if the user is part of the conversation
 */
Conversation.isOwnConversation = async function (userId, conversationId) {
  let conversation = null;

  try {
    conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
    });
  } catch (e) {
    console.log(e);
  }

  return !!conversation;
};

module.exports = Conversation;
