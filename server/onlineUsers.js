const onlineUsers = {
  _onlineUsers: new Map(),
  _socketsByUser: new Map(),
  isOnline: function(id) {
    return this._onlineUsers.has(id);
  },
  add: function(id, socketId) {
    if (this.isOnline(id)) {
      this._onlineUsers.get(id).add(socketId);
    } else {
      this._onlineUsers.set(id, new Set([socketId]));
    }
    this._addSocket(id, socketId);
  },
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
  getSocketsByUserId: function(id) {
    const userSessions = this._onlineUsers.get(id);
    if (userSessions) {
      return userSessions.values();
    } else {
      return [];
    }
  },
  getUserBySocket(socketId) {
    return this._socketsByUser.get(socketId);
  },
  _addSocket(id, socketId) {
    this._socketsByUser.set(socketId, id);
  },
  _removeSocket(socketId) {
    this._socketsByUser.delete(socketId);
  },
};
module.exports = onlineUsers;
