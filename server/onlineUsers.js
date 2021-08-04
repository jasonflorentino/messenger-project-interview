const onlineUsers = {
  store: new Map(),
  includes: function(id) {
    return this.store.has(id);
  },
  add: function(id) {
    return this.store.set(id, true);
  },
  remove: function(id) {
    return this.store.delete(id);
  }
};
module.exports = onlineUsers;
