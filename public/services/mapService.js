import { createPulsingDot } from './pulsingDot.js';
import { showChat, clearChat } from './chatService.js';
import { joinRoom, roomList } from './socketService.js';

export let map;
export let currentRoom;
export let roomMap = {};

export function initMapService() {
    maptilersdk.config.apiKey = "syKwELsCprSgbyOwzdTS";
    map = new maptilersdk.Map({
        container: "map",
        style: "2c7c4063-5486-490c-9c0a-c8e53ff87e5d",
        geolocate: maptilersdk.GeolocationType.POINT,
        zoom: 13,
    });

    window.map = map;

    map.on('load', function () {
        requestUserLocation();
        loadRoomList(); 
    });
}

export function newChat(size, lat, long, id, delayOffset, duration) {
    const pulsingDot = createPulsingDot(size, { r: 100, g: 200, b: 255 }, delayOffset, duration, map);

    map.addImage(`pulsing-dot-${id}`, pulsingDot, { pixelRatio: 2 });
    roomMap[id] = pulsingDot;

    map.addSource(`points-${id}`, {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [long, lat]
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
                        'circle-color': '#00FF00', 
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

function loadRoomList() {
    roomList.forEach((room) => {
        newChat(100, room.lat, room.long, room.id, 0, 2000);
        if (room.messageHistory.length > 0) {
            roomMap[room.id].startPulsing();
        }
    });
}
