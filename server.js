const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const { join } = require('path');

const { formatMessage } = require('./utils/messages');
const {
  getCurrentUser,
  getRoomUsers,
  userJoin,
  userLeave,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 4321 || process.env.PORT;
const botName = 'ChatCord Bot';

app.use(express.static(join(__dirname, 'public')));

// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ room, username }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the room.`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // When client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the room.`)
      );

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} 🍆`);
});
