import { map, currentRoom } from './mapService.js';
import { createRoom, socketId, socket } from '../services/socketService.js';



let chatMessages;
let chatContainer;
let mapWrap;

export function initChatService() {
    chatMessages = document.getElementById('chat-messages');
    chatContainer = document.getElementById('chat-container');
    mapWrap = document.getElementById('map-wrap');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const hideChatButton = document.getElementById('hide-chat-button');

    document.getElementById('add-chat-button').addEventListener('click', () => {
        map.getCanvas().style.cursor = 'crosshair';

        map.once('click', function(e) {
            const coordinates = e.lngLat;
            const lat = coordinates.lat;
            const long = coordinates.lng;
            
            createRoom(lat, long);
            
            map.getCanvas().style.cursor = '';
        });
    });

    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message !== '') {
            addMessage(message, 'sent');
            messageInput.value = '';
            messageInput.focus();
            socket.emit('newMessage', {text: message, roomID: currentRoom, id: socketId});
        }
    });

    messageInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    hideChatButton.addEventListener('click', function() {
        chatContainer.classList.remove('active');
        mapWrap.classList.remove('chat-active');
        currentRoom = -1;
        setTimeout(function() {
            map.resize();
        }, 300); 
    });
}

export function addMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', type);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = text;

    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function clearChat() {
    if (chatMessages) {
        chatMessages.innerHTML = '';
        chatMessages.scrollTop = 0;
    }
}

export function showChat() {
    chatContainer.classList.add('active');
    mapWrap.classList.add('chat-active');

    setTimeout(function() {
        map.resize();
    }, 300); 
}
