import "/socket.io/socket.io.js";
import { createPulsingDot } from './services/pulsingDot.js';


const socket = io("http://localhost:8001");
  
let chatMessages;
let roomList;


document.addEventListener('DOMContentLoaded', function () {
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    
    const hideChatButton = document.getElementById('hide-chat-button');
    const chatContainer = document.getElementById('chat-container');
    const mapWrap = document.getElementById('map-wrap');

    
      
    

    document.getElementById('add-chat-button').addEventListener('click', () => {
         
        map.getCanvas().style.cursor = 'crosshair';

        map.once('click', function(e) {
            
            const coordinates = e.lngLat;
            const lat = coordinates.lat;
            const long = coordinates.lng;
            
            const id = createRoom(lat, long);
            
            map.getCanvas().style.cursor = '';
        });
    });
   


    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message !== '') {
            addMessage(message, 'sent');
            messageInput.value = '';
            messageInput.focus();
            socket.emit('newMessage', {text: message, roomID: currentRoom})
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
        // Resize the map after transition
        currentRoom = -1;
        setTimeout(function() {
            map.resize();
        }, 300); // Match the CSS transition duration
    });

 
    
  
  
});

function addMessage(text, type) {
    const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = text;

        messageElement.appendChild(messageContent);
        chatMessages.appendChild(messageElement);

        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

function clearChat() {
     const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        chatMessages.scrollTop = 0;
    }
    
}

export function createRoom( lat, long ) {
    socket.emit('createRoom', { 'lat': lat, 'long': long });
    
}

export function joinRoom(roomId) {
    clearChat();
    socket.emit('joinRoom', roomId);
}

socket.on('newRoom', (room) => {
    console.log('newRoom')
     newChat(100, room.lat, room.long, room.id, 0, 2000);
    
});


  
socket.on('messageHistory', (messages) => {
    
    messages.forEach((message => {
        addMessage(message, "received")
    }));

    
});

socket.on('newMessage', (message) => {
    console.log(message)
    addMessage(message, "received")
});
  
socket.on('roomActivity', (roomId) => {
    if (roomMap[roomId] && roomId != currentRoom) {
        roomMap[roomId].startPulsing();
    }
})


    // const showChatButton = document.getElementById('show-chat-button');
    const hideChatButton = document.getElementById('hide-chat-button');
    const chatContainer = document.getElementById('chat-container');
    const mapWrap = document.getElementById('map-wrap');
export function showChat() {
      chatContainer.classList.add('active');
        mapWrap.classList.add('chat-active');
        // showChatButton.style.display = 'none';

        // Resize the map after transition
        setTimeout(function() {
            map.resize();
        }, 300); // Match the CSS transition duration
}




maptilersdk.config.apiKey = "syKwELsCprSgbyOwzdTS";
const map = new maptilersdk.Map({
    container: "map",
    style: "2c7c4063-5486-490c-9c0a-c8e53ff87e5d",
    geolocate: maptilersdk.GeolocationType.POINT,
    zoom: 13,
});

window.map = map;

const apiKey = "syKwELsCprSgbyOwzdTS";
const url = `https://api.maptiler.com/geolocation/ip.json?key=${apiKey}`;
let currentRoom;
let roomMap = {};


function newChat(size, lat, long, id, delayOffset, duration) {
    
            const pulsingDot = createPulsingDot(size, { r: 100, g: 200, b: 255 }, delayOffset, duration, map);

    map.addImage(`pulsing-dot-${id}`, pulsingDot, { pixelRatio: 2 });
    roomMap[id] = pulsingDot;

            // Add the source and layer
            map.addSource(`points-${id}`, {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [(long), ( lat)]
                            },
                            'properties': {
                                'id': id
                            }
                        }
                    ]
                }
            });

            map.addLayer({
                'id': `points-${id}`,
                'type': 'symbol',
                'source': `points-${id}`,
                'layout': {
                    'icon-image': `pulsing-dot-${id}`,
                    'icon-allow-overlap': true,
                    'icon-size': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 0.5,
                        20, 1
                    ]
                }
            });

            map.on('click', `points-${id}`, function(e) {
                const feature = e.features[0];
                const coordinates = feature.geometry.coordinates.slice();
                currentRoom = feature.properties.id;
                clearChat();
                roomMap[currentRoom].stopPulsing();
                joinRoom(currentRoom);
                showChat();
               
            });

            map.on('mouseenter', `points-${id}`, function() {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', `points-${id}`, function() {
                map.getCanvas().style.cursor = '';
            });
        
}


function requestUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                map.setCenter([longitude, latitude]);

                const userLocation = {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [longitude, latitude]
                            }
                        }
                    ]
                };

                map.addSource('user-location', {
                    'type': 'geojson',
                    'data': userLocation
                });

                map.addLayer({
                    'id': 'user-location-layer',
                    'type': 'circle',
                    'source': 'user-location',
                    'paint': {
                        'circle-radius': 3,
                        'circle-color': '#00FF00', // Light green
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#FFFFFF'
                    }
                });
            },
            error => {
                console.error('Geolocation error:', error);
                map.setZoom(13); 
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

socket.on('roomList', (list) => {
    
    roomList = list;   
    
})

function loadRoomList() {
    roomList.forEach((room) => {
        
        newChat(100, room.lat, room.long, room.id, 0, 2000);
        if (room.messageHistory.length > 0) {
            roomMap[room.id].startPulsing();
        }
    })

}


// Wait until the map is loaded before adding layers
map.on('load', function () {
    // Request the user's precise location
    requestUserLocation();
    loadRoomList(); 

    
});

