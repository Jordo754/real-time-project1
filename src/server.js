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
let i = 0;
let userCount = 0;
const baseBoard = {
  colors: ['white', 'black', 'white', 'black', 'white', 'black', 'white', 'black',
           'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white',
           'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black',
           'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white',
           'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black',
           'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white',
           'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black',
           'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'],
  spaces: [0, 1, 0, 1, 0, 1, 0, 1,
           1, 0, 1, 0, 1, 0, 1, 0,
           0, 1, 0, 1, 0, 1, 0, 1,
           0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0,
           2, 0, 2, 0, 2, 0, 2, 0,
           0, 2, 0, 2, 0, 2, 0, 2,
           2, 0, 2, 0, 2, 0, 2, 0],
};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    // check if room isn't full
    if (userCount < 2) {
      socket.join(`room${i}`);
      socket.room = `room${i}`;
      console.log('user joined ' + socket.room);
      userCount++;
    }

    // check if room just filled
    if (userCount >= 2) {
      // send out the room info to the users
      const colorRand = Math.round(Math.random() + 1);
      if (colorRand === 1) {
        socket.emit('load', { board: baseBoard, color: 1, myTurn: true });
        socket.broadcast.to(socket.room).emit('load', { board: baseBoard, color: 2, myTurn: false });
      } else {
        socket.emit('load', { board: baseBoard, color: 2, myTurn: false });
        socket.broadcast.to(socket.room).emit('load', { board: baseBoard, color: 1, myTurn: true });
      }

      // reset count and next room
      userCount = 0;
      i++;
    }
  });
};

const onMsg = (sock) => {
  const socket = sock;
  
  socket.on('clientUpdate', (data) => {
    data.boardSpaces[data.currentSpace] = data.boardSpaces[data.selectedPiece];
    data.boardSpaces[data.selectedPiece] = 0;
    if (data.jumpedSpace != -1) {
      data.boardSpaces[data.jumpedSpace] = 0;
      socket.broadcast.to(socket.room).emit('update', { pieceCount: data.pieceCount - 1, boardSpaces: data.boardSpaces });
    } else {
      socket.broadcast.to(socket.room).emit('update', { pieceCount: data.pieceCount, boardSpaces: data.boardSpaces });
    }
    
  });
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
