const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', {
  username,
  room,
});

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Add message to DOM
const outputMessage = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
  ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
};

// Add Room name to DOM
const outputRoomName = (room) => {
  roomName.innerText = room;
};

// Add Users name to DOM
const outputUsers = (users) => {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
};
