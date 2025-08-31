/** @type{HTMLCanvasElement} */
const canvas = document.getElementById("canv");
const ctx = canvas.getContext("2d");

var SFN; // scale fit native

var keys = {};

var mouse = {
    x: 0,
    y: 0,
    down: false,
    cycled: true
};

var states = {
    0: "menu",
    1: "playing",
    2: "dead"
};
var gameState = 0;

var effects;

function start() {
    image.loadImages();
    sfx.load();
    music.loadSongs();
    canvasResize();
    effects = new Effects();
    initGame();
    update();
}

function update() {
    if(states[gameState] == "playing") {
        player.update();
        rooms[player.currentRoom].update();
        if(combatGame != null) {
            combatGame.update();
        }
    }
    effects.update();
    draw();
    requestAnimationFrame(update);
}

function draw() {
    if(states[gameState] == "menu") {
        drawTitleScreen();
    }
    if(states[gameState] == "playing") {
        if(effects.shakeTick > 0) {
            ctx.translate(effects.shakeCoords.x, effects.shakeCoords.y);
        }
        ctx.fillStyle = "#5d5d5d";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image.mainFloor, 0, 0, canvas.width,canvas.height);
        rooms[player.currentRoom].draw();
        player.draw();
        player.drawInventory();
        if(combatGame != null) {
            combatGame.draw();
        }
    }
    if(states[gameState] == "dead") {
        drawDeadScreen();
    }
    effects.draw();
    ctx.setTransform(1,0,0,1,0,0)
}

function canvasResize() {
    if(window.innerWidth*0.75 < window.innerHeight) {
        canvas.width = window.innerWidth*0.95;
        canvas.height = canvas.width*0.75;
    } else {
        canvas.height = window.innerHeight*0.95;
        canvas.width = canvas.height*(4/3);
    }
    SFN = Math.min(canvas.width, canvas.height)/750;
    ctx.imageSmoothingEnabled=false;
}

function keyDown(e) {
    keys[e.code] = true;
}

function keyUp(e) {
    keys[e.code] = false;
}

function mouseDown(e) {
    mouse.x = (e.clientX-canvas.offsetLeft)/SFN;
    mouse.y = (e.clientY-canvas.offsetTop)/SFN;
    mouse.down = true;
    sfx.click.play();
}

function mouseMove(e) {
    mouse.x = (e.clientX-canvas.offsetLeft)/SFN;
    mouse.y = (e.clientY-canvas.offsetTop)/SFN;
}

function mouseUp() {
    mouse.down = false;
    mouse.cycled = true;
}

document.body.onload = start;
document.body.onresize = canvasResize;
document.onkeydown = keyDown;
document.onkeyup = keyUp;
document.onmousedown = mouseDown;
document.onmousemove = mouseMove;
document.onmouseup = mouseUp;