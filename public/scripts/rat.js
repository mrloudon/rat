/* global Utility */

const Rat = (function () {

    const MILLIS_TENTH = 100;
    const MILLIS_SEC = 1000;
    const MILLIS_MIN = 1000 * 60;
    const MILLIS_HR = 60 * MILLIS_MIN;
    const PX_PER_MM = 600 / 93;
    const CM_1 = 10 * PX_PER_MM;

    const Star = {

        initialise(context, center, nSides, radius1, radius2, color) {
            this.ctx = context;
            this.nSides = nSides;
            this.radius1 = radius1;
            this.radius2 = radius2;
            this.color = color;
            this.setPosition(center);
        },

        setPosition(center) {
            this.vertices = [];
            this.center = center;
            const deltaTheta = 2 * Math.PI / this.nSides;
            let innerTheta = 0;
            let x, y;
            let outerTheta = innerTheta + deltaTheta / 2;
            for (let n = 0; n < this.nSides; n++) {
                x = this.radius1 * Math.cos(innerTheta) + center.x;
                y = this.radius1 * Math.sin(innerTheta) + center.y;
                this.vertices.push([x, y]);
                x = this.radius2 * Math.cos(outerTheta) + center.x;
                y = this.radius2 * Math.sin(outerTheta) + center.y;
                this.vertices.push([x, y]);
                innerTheta += deltaTheta;
                outerTheta += deltaTheta;
            }
            this.boundary = [this.center.x - this.radius1, this.center.y - this.radius1, this.radius1 * 2, this.radius1 * 2];
        },

        draw() {
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.moveTo(...this.vertices[0]);
            for (let n = 1; n < this.vertices.length; n++) {
                this.ctx.lineTo(...this.vertices[n]);
            }
            this.ctx.closePath();
            this.ctx.fill();
        },
         
        clear() {
            this.ctx.clearRect(...this.boundary);
        }

    };

    const Square = {

        initialise(context, center, sideLength, color) {
            this.ctx = context;
            this.center = center;
            this.sideLength = sideLength;
            this.color = color;
            this.setPosition(center);
        },

        draw() {
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.rect(...this.boundary);
            this.ctx.closePath();
            this.ctx.fill();
        },

        clear() {
            this.ctx.clearRect(...this.boundary);
        },

        setPosition(pos) {
            this.center = pos;
            this.boundary = [this.center.x - this.sideLength / 2, this.center.y - this.sideLength / 2, this.sideLength, this.sideLength];
        },

        inside(point) {
            return this.boundary[0] <= point.x && point.x <= this.boundary[0] + this.boundary[2] &&
                this.boundary[1] <= point.y && point.y <= this.boundary[1] + this.boundary[3];
        }

    };

    const Circle = {

        initialise(context, center, radius, color) {
            this.ctx = context;
            this.center = center;
            this.radius = radius;
            this.color = color;
            this.setPosition(center);
        },

        draw() {
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.fill();
        },

        clear() {
            this.ctx.clearRect(...this.boundary);
        },

        setPosition(pos) {
            this.center = pos;
            this.boundary = [this.center.x - this.radius, this.center.y - this.radius, 2 * this.radius, 2 * this.radius];
        },

        inside(point) {
            return (this.center.x - point.x) ** 2 + (this.center.y - point.y) ** 2 <= this.radius ** 2
        }

    };

    function run() {
        const coordsFB = document.querySelector("h3.coords");
        const stopBtn = document.getElementById("stop-btn");
        const whiteBtn = document.getElementById("white-btn");
        const blackBtn = document.getElementById("black-btn");
        const timeSpan = document.getElementById("time-span");
        const canvas = document.getElementById("c");
        const context = canvas.getContext("2d");
        const position = { x: 200, y: 250 };
        let minX, maxX, direction;
        let stopAnimation = false;
        let startTime, stimulusType, shape;

        async function onClick(e) {
            const rect = e.target.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left); //x position within the element.
            const y = Math.round(e.clientY - rect.top);  //y position within the element.
            const targetHit = shape.inside({ x, y });
            const resp = await fetch(`/tap?x=${x}&y=${y}&hit=${targetHit}&t=${Date.now() - startTime}&stim=${stimulusType}`);
            console.log(resp.statusText);
        }

        function animationLoop() {
            if (stopAnimation) {
                shape.clear();
                return;
            }
            position.x += direction;
            if ((direction > 0 && position.x > maxX) || (direction < 0 && position.x < minX)) {
                direction *= -1;
                window.requestAnimationFrame(animationLoop);
                return;
            }
            shape.clear();
            shape.setPosition(position);
            shape.draw();
            window.requestAnimationFrame(animationLoop);
        }

        stopBtn.addEventListener("click", () => stopAnimation = true);
        whiteBtn.addEventListener("click", () => canvas.style.backgroundColor = "white");
        blackBtn.addEventListener("click", () => canvas.style.backgroundColor = "black");

        canvas.addEventListener("mousedown", onClick);

        shape = Star;
        stimulusType = "circle1";
        minX = 100;
        maxX = 900;
        position.y = 450;
        position.x = minX;
        shape.initialise(context, position, 7, 100, 65, "green");
        shape.draw();

        direction = 4;
        requestAnimationFrame(animationLoop);

        startTime = Date.now();
        setInterval(() => {
            let diff = Date.now() - startTime;
            let hours = Math.floor(diff / MILLIS_HR).toString();
            diff %= MILLIS_HR;
            let mins = Math.floor(diff / MILLIS_MIN).toString();
            diff %= MILLIS_MIN;
            let secs = Math.floor(diff / MILLIS_SEC).toString();
            diff %= MILLIS_SEC;
            let tenths = Math.floor(diff / MILLIS_TENTH);
            if (hours.length < 2) {
                hours = "0" + hours;
            }
            if (mins.length < 2) {
                mins = "0" + mins;
            }
            if (secs.length < 2) {
                secs = "0" + secs;
            }
            timeSpan.innerHTML = `${hours}:${mins}:${secs}.${tenths}`;
        }, 100);

        coordsFB.innerHTML = "Running";
    }

    return { run };

}());

Utility.ready(Rat.run);