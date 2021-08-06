const helpers = {
  connectSocketWithToken,
  disconnectSocketWithToken,
}
export default helpers;

/**
 * Attach an auth token to a socket and manually connect
 */
export function connectSocketWithToken(socket, token) {
  socket.auth.token = token;
  socket.connect();
}

/**
 * Remove the auth token from a socket and disconnect 
 */ 
export function disconnectSocketWithToken(socket) {
  socket.auth.token = null;
  socket.disconnect();
}