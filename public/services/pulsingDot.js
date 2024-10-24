export function createPulsingDot(size, color, delayOffset, duration, map) {
    let isPulsing = false;
    return {
        width: size *2,
        height: size*2,
        data: new Uint8Array(size * size * 16), // RGBA data array

        onAdd: function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },

          startPulsing: function () {
            isPulsing = true;
            map.triggerRepaint(); 
        },


        stopPulsing: function () {
            isPulsing = false;
        },

        render: function () {

             
            var t = ((performance.now() + delayOffset) % duration) / duration;

            var radius = (size / 2) * 0.3;
            var outerRadius = (size / 2) * 2 * t + radius;
            var context = this.context;

            context.clearRect(0, 0, this.width, this.height);

            // Draw outer circle
            if (isPulsing) {
               context.beginPath();
            context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
            context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.6 - t})`;
            context.fill();
            }
            else {
                 var staticGlowRadius = (size / 2) * 3 / 7; 
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, staticGlowRadius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
                context.fill();
            }

            

            // Draw inner circle
            context.beginPath();
            context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
            context.strokeStyle = 'white';
            context.lineWidth = 2;
            context.fill();
            context.stroke();


            const imageData = context.getImageData(0, 0, this.width, this.height);
            this.data = new Uint8Array(imageData.data); 

            map.triggerRepaint();

            return true;
        }
    };
}
