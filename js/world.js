const tileSize = 50;

var map = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1]
]

const mapSizeX = 10;
const mapSizeY = 10;

var rooms = [];

const roomDataTypes = {
    0: "blank",
    1: "wall",
    2: "chest",
    3: "enemy",
    4: "boss",
    5: "machine",
};

class Tile {
    constructor(x, y, floor = false) {
        this.x = x;
        this.y = y;
        this.floor = floor;
        this.image = this.floor ? image.floor : image.tile;
    }
    draw() {
        //ctx.fillStyle = "#c7cfdd";
        //ctx.fillRect(this.x*SFN, this.y*SFN, tileSize*SFN, tileSize*SFN);

        ctx.drawImage(this.image, this.x*SFN, this.y*SFN, tileSize*SFN, tileSize*SFN);
    }
    update() {
        this.playerCollision();
    }
    playerCollision() {
        if(player.x + player.size > this.x && player.x < this.x + tileSize && player.y + player.size > this.y && player.y < this.y + tileSize) {
            var diffX = (player.x+player.size/2) - (this.x+tileSize/2);
            var diffY = (player.y+player.size/2) - (this.y+tileSize/2);
            var minXDist = player.size/2 + tileSize/2;
            var minYDist = player.size/2 + tileSize/2;
            var depthX = diffX > 0 ? minXDist - diffX : -minXDist - diffX
            var depthY = diffY > 0 ? minYDist - diffY : -minYDist - diffY
            if(depthX != 0 && depthY != 0){
              if(Math.abs(depthX) < Math.abs(depthY)){
                if(depthX > 0){
                    player.x = this.x+tileSize;
                }
                else{
                    player.x = this.x-player.size;
                }
              }
              else{
                if(depthY > 0){
                   player.y = this.y+tileSize;
                }
                else{
                   player.y = this.y-player.size;
                }
              }
            }
        }
    }
}

class Room {
    constructor(x, y, blank, type = -1) {
        this.x = x;
        this.y = y;
        this.blank = blank;
        if(type == -1) {
            this.type = Math.floor(Math.random() * (Object.keys(roomData).length-1))+1;
        } else {
            this.type = type;
        }
        this.tiles = [];
        this.floorTiles = [];
        this.chests = [];
        this.enemies = [];
        this.machines = [];
        if(!this.blank) {
            this.createTiles();
        }
    }
    createTiles() {
        let rd = roomData[this.type];
        for(let y = 0; y < rd.length; y++) {
            for(let x = 0; x < rd[y].length; x++) {
                if(roomDataTypes[rd[y][x]] == "wall") {
                    if(this.y != 0) {
                        if(y == 0 && x > 8 && x < 12) {
                            if(map[this.y-1][this.x] == 1) {
                                continue;
                            }
                        }
                    }
                    if(this.y != map.length-1) {
                        if(y == rd.length-1 && x > 8 && x < 12) {
                            if(map[this.y+1][this.x] == 1) {
                                continue;
                            }
                        }
                    }
                    if(this.x != 0) {
                        if(x == 0 && y > 5 && y < 9) {
                            if(map[this.y][this.x-1] == 1) {
                                continue;
                            }
                        }
                    }
                    if(this.x != map[0].length-1) {
                        if(x == rd[y].length-1 && y > 5 && y < 9) {
                            if(map[this.y][this.x+1] == 1) {
                                continue;
                            }
                        }
                    }
                    this.tiles.push(new Tile(x*tileSize, y*tileSize));
                } else if (roomDataTypes[rd[y][x]] == "blank") {
                    if(y > 0) {
                        if(y == 1 && this.y != 0 && x > 8 && x < 12) {
                            if(map[this.y-1][this.x] == 1) {
                                continue;
                            }
                        }
                        if(roomDataTypes[rd[y-1][x]] == "wall") {
                            this.floorTiles.push(new Tile(x*tileSize, y*tileSize, true));
                        }
                    }
                } else{
                    this.createOtherElements(rd,x,y);
                }
            }
        }
    }
    createOtherElements(rd, x,y) {
        if(roomDataTypes[rd[y][x]] == "chest") {
            this.chests.push(new Chest(x*tileSize, y*tileSize));
        }
        if(roomDataTypes[rd[y][x]] == "enemy") {
            this.enemies.push(new Enemy(x*tileSize, y*tileSize));
        }
        if(roomDataTypes[rd[y][x]] == "machine") {
            this.machines.push(new Machine(x*tileSize, y*tileSize));
        }
    }
    draw() {
        for(let tile of this.tiles) {
            tile.draw();
        }
        for(let tile of this.floorTiles) {
            tile.draw();
        }
        for(let chest of this.chests) {
            chest.draw();
        }
        for(let machine of this.machines) {
            machine.draw();
        }
        for(let enemy of this.enemies) {
            enemy.draw();
        }
    }
    update() {
        for(let tile of this.tiles) {
            tile.update();
        }
        for(let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update();
            if(this.enemies[i].dead) {
                this.enemies.splice(i,1);
            }
        }
        for(let chest of this.chests) {
            chest.update();
        }
        for(let machine of this.machines) {
            machine.update();
        }
    }
}

function createRooms() {
    for(let y = 0; y < map.length; y++) {
        for(let x = 0; x < map[y].length; x++) {
            let blank = map[y][x] == 0;
            let type = (y == 2 && x == 2) ? 0 : -1;
            rooms.push(new Room(x, y, blank, type));
        } 
    }
}

function generateMap() {
    map = [];
    for(let y = 0; y < mapSizeY; y++) {
        let n = [];
        for(let x = 0; x < mapSizeX; x++) {
            let value = Math.random() < 0.2 ? 0 : 1;
            if(y == 2 && x == 2) {
                value = 1;
            }
            n.push(value);
        }
        map.push(n);
    }
}