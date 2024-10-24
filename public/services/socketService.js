import "/socket.io/socket.io.js";
import { newChat, roomMap, currentRoom } from './mapService.js';
import { addMessage, clearChat } from './chatService.js';

export let socket;
export let roomList = [];
export let socketId;

export function initSocketService() {
    socket = io("http://localhost:8001");

    socket.on('socketId', (socketid) => {
        socketId = socketid;
    })

    socket.on('newRoom', (room) => {
        console.log('newRoom');
        newChat(100, room.lat, room.long, room.id, 0, 2000);
    });

    socket.on('messageHistory', (messages) => {
        messages.forEach((message) => {
            if (message.id != socketId) {
               addMessage(message.text, 'received'); 
            }
            else {
               addMessage(message.text, 'sent');  
            }
            
        });
    });

    socket.on('newMessage', (message) => {
        console.log(message);
        addMessage(message.text, 'received');
    });

    socket.on('roomActivity', (roomId) => {
        if (roomMap[roomId] && roomId != currentRoom) {
            roomMap[roomId].startPulsing();
        }
    });

    socket.on('roomList', (list) => {
        roomList = list;
    });
}

export function createRoom(lat, long) {
    socket.emit('createRoom', { 'lat': lat, 'long': long });
}

export function joinRoom(roomId) {
    clearChat();
    socket.emit('joinRoom', roomId);
}
