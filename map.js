maptilersdk.config.apiKey = "syKwELsCprSgbyOwzdTS";
const map = new maptilersdk.Map({
    container: "map",
    style: "2c7c4063-5486-490c-9c0a-c8e53ff87e5d",
    geolocate: maptilersdk.GeolocationType.POINT,
    zoom: 13,
});

const apiKey = "syKwELsCprSgbyOwzdTS";
const url = `https://api.maptiler.com/geolocation/ip.json?key=${apiKey}`;

// Wait until the map is loaded before adding layers
map.on('load', function () {

    // Define the function to add a pulsing dot
    function newChat(size, latOffset, longOffset, id, delayOffset, duration) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const { latitude, longitude } = data;

                var pulsingDot = {
                    width: size,
                    height: size,
                    data: new Uint8Array(size * size * 4),

                    onAdd: function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = this.width;
                        canvas.height = this.height;
                        this.context = canvas.getContext('2d');
                    },

                    render: function () {
                        var t = ((performance.now() + delayOffset) % duration) / duration; // Add a delay to desync the pulses

                        var radius = (size / 2) * 0.3;
                        var outerRadius = (size / 2) * 0.7 * t + radius;
                        var context = this.context;

                        context.clearRect(0, 0, this.width, this.height);
                        context.beginPath();
                        context.arc(
                            this.width / 2,
                            this.height / 2,
                            outerRadius,
                            0,
                            Math.PI * 2
                        );
                        context.fillStyle = 'rgba(100, 200, 255,' + (.6 - t) + ')';
                        context.fill();

                        this.data = context.getImageData(
                            0,
                            0,
                            this.width,
                            this.height
                        ).data;

                        map.triggerRepaint();

                        return true;
                    }
                };

                map.addImage(`pulsing-dot-${id}`, pulsingDot, { pixelRatio: 2 });

                map.addSource(`points-${id}`, {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': [(longitude + longOffset), (latitude + latOffset)]
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
                        'icon-image': `pulsing-dot-${id}`
                    }
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Add multiple pulsing dots with different delay offsets and durations to desynchronize the pulses
    newChat(300, .002, .003, 1, 0, 3000);  // 3 seconds duration
    
    
});


