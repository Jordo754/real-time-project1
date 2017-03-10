const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(app);

// object for rooms and users
const roomList = {};



const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    if (roomList['room1'].keys.size() < 4) {
      roomList['room1'][roomList.keys.size()] = socket;
    } else {
      socket.emit('join', {code: 1});
    }
  });
};

const onMsg = (sock) => {
  const socket = sock;
  
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    
  });
};

io.sockets.on('connection', (socket) => {
  console.log('started');

  onJoined(socket);
  onMsg(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');
