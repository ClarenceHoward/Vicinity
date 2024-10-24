import { createPulsingDot } from './pulsingDot.js';
import {showChat, createRoom, joinRoom} from './script.js'

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
export let currentRoom;


export function newChat(size, lat, long, id, delayOffset, duration) {
    
            const pulsingDot = createPulsingDot(size, { r: 100, g: 200, b: 255 }, delayOffset, duration, map);

            map.addImage(`pulsing-dot-${id}`, pulsingDot, { pixelRatio: 2 });

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
document.addEventListener('DOMContentLoaded', () => {
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
});

// Wait until the map is loaded before adding layers
map.on('load', function () {
    // Request the user's precise location
    requestUserLocation();

    
});





