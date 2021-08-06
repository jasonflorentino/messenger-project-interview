const onlineUsers = {
  /**
   * @name _onlineUsers
   * @type {Map<Number, Set<Number>>}  
   * @description Maps `userIds` to a Set that stores `socketIds`
   */
  _onlineUsers: new Map(),
  /**
   * @name _socketsByUser  
   * @type {Map<Number, Number>}  
   * @description Maps `socketIds` to their respective `userId`
   */
  _socketsByUser: new Map(),
  /** Checks if a user is online given their ID */
  isOnline: function(id) {
    return this._onlineUsers.has(id);
  },
  /** Adds a new socketId to the collection of online users */
  add: function(id, socketId) {
    if (this.isOnline(id)) {
      this._onlineUsers.get(id).add(socketId);
    } else {
      this._onlineUsers.set(id, new Set([socketId]));
    }
    this._addSocket(id, socketId);
  },
  /** Removes a socketId from the collection of online users */
  remove: function(id, socketId) {
    if (this.isOnline(id)) {
      const sessions = this._onlineUsers.get(id);
      sessions.delete(socketId);
      this._removeSocket(socketId);
      if (sessions.size === 0) {
        this._onlineUsers.delete(id);
      }
    }
  },
  /** Gets a list of all `socketIds` given some `userId` */
  getSocketsByUserId: function(id) {
    const userSessions = this._onlineUsers.get(id);
    if (userSessions) {
      return userSessions.values();
    } else {
      return [];
    }
  },
  /** Gets a `userId` given some `socketId` */
  getUserBySocket: function(socketId) {
    return this._socketsByUser.get(socketId);
  },
  /** @private Stores a `userId` for a given `socketId` */
  _addSocket: function(id, socketId) {
    this._socketsByUser.set(socketId, id);
  },
  /** @private Removes a `socketId` from the store of `socketIds` */
  _removeSocket: function(socketId) {
    this._socketsByUser.delete(socketId);
  },
};
module.exports = onlineUsers;
