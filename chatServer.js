const express = require('express');
const app = express();
const socketio = require('socket.io');

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8001);
const io = socketio(expressServer);
let rooms = {};
let numRooms = 0;

io.on('connection', (socket) => {

    socket.emit('socketId', socket.id);
   
    socket.emit('roomList', Object.values(rooms));

    socket.on('createRoom', (data) => {
        console.log("createRoom")
        const roomId = numRooms;
        numRooms++;
        const newRoom = {
            id: roomId,
            lat: data.lat,
            long: data.long,
            messageHistory: [],
        };
        rooms[roomId] = newRoom;
        io.emit('newRoom', newRoom);
        console.log(rooms)
        
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);

        if (rooms[roomId]) {
            socket.emit('messageHistory', rooms[roomId].messageHistory);
        }
    });

    socket.on('newMessage', (data) => {
        const message = data.text
        const roomId = data.roomID
        const socketId = data.id;

        if (rooms[roomId]) {
            rooms[roomId].messageHistory.push({ text: message, id: socketId });

            socket.broadcast.to(roomId).emit('newMessage', { text: message, id: socketId });
            socket.broadcast.emit('roomActivity', roomId);
        }
    });
})

app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/public/404/404.html');
});
