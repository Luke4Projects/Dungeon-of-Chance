class Player {
    constructor() {
        this.x = 400;
        this.y = 400;
        this.size = tileSize;
        this.currentRoom = 22;

        this.chips = 0;
        this.totalChips = 0;

        this.cards = [4, 6, 3, 5, 7, 8];
        this.maxAmountOfCards = 25;
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.inventoryOpen = false;
        this.canOpenInventory = true;
        this.selectedCardSwap = null;
        this.currentChest = null;
        this.inventoryWasOpen = false;

        this.displayMessage = null;
        this.displayMessageTick = 0;

        this.currentMachine = null;

        this.xVelocity = 0;
        this.yVelocity = 0;
        this.moving = false;

        this.moveSpeed = 0.3;
        this.friction = 0.9;

        this.frameX = 0;
        this.frameY = 0;
        this.animationTick = 0;
        this.animationSpeed = 15;
        this.frames = 2;
    }
    draw() {
        this.animate();
        let renderX = (this.x-this.size/2)*SFN;
        let renderY = (this.y-this.size/2)*SFN;
        ctx.drawImage(image.player, this.frameX*32, this.frameY*32, 32, 32, renderX, renderY, this.size*2*SFN, this.size*2*SFN);

        //ctx.strokeStyle = "red";
        //ctx.strokeRect(this.x*SFN,this.y*SFN,this.size*SFN,this.size*SFN);
    }
    drawInventory() {

        ctx.drawImage(image.chip, 20*SFN, 630*SFN,40*SFN, 40*SFN);
        ctx.fillStyle = "black";
        ctx.font = `${30*SFN}px Tiny5`;
        ctx.fillText(player.chips, 65*SFN, 657*SFN);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        let amount = this.cards.length < 6 ? this.cards.length : 5;
        for(let i = 0; i < amount; i++) {
            let x = 16+i*50;
            ctx.strokeRect(x*SFN, 674*SFN, 50*SFN, 50*SFN);
            ctx.drawImage(image.cards, (this.cards[i]-1)*23, 0, 23, 26, 2+x*SFN, 676*SFN, 45*SFN, 45*SFN);
        }
        if(this.inventoryOpen && combatGame == null && this.currentChest == null && this.currentMachine == null) {
            this.drawExtraInventory();
        } else {
            if(this.currentChest == null) {
                if(this.currentMachine == null) {
                    this.selectedCardSwap = null;
                } else {
                    if(this.currentMachine.inputCard != null) {
                        this.selectedCardSwap = null;
                    }
                }
            }
        }
        this.drawChest();
        this.drawMachine();
        this.drawMessage();
    }
    drawChest() {
        if(this.currentChest != null && combatGame == null) {
            let x = 400;
            let y = 475;
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#8a4836";
            ctx.fillRect(x*SFN, y*SFN, 250*SFN, 150*SFN);
            ctx.restore();
            ctx.strokeStyle = "gold";
            ctx.lineWidth = 2;
            ctx.strokeRect(x*SFN, y*SFN, 250*SFN, 150*SFN);
            ctx.lineWidth = 1;
            if(this.currentChest.health) {
                let hx = x;
                let hy = y+50;
                ctx.strokeStyle = "white";
                if(mouse.x > hx && mouse.x < hx+50 && mouse.y > hy && mouse.y < hy+50) {
                    ctx.strokeStyle = "blue";
                    if(mouse.down) {
                        if(player.health != player.maxHealth) {
                            this.health = this.maxHealth;
                            this.currentChest.health = false;
                        } else {
                            this.displayMessage = "ALREADY AT MAX HEALTH";
                        }
                    }
                }
                ctx.lineWidth = 1;
                ctx.strokeRect(hx*SFN,hy*SFN,50*SFN,50*SFN);
                ctx.drawImage(image.healthPotion,(hx+4)*SFN,(hy+2)*SFN,40*SFN,45*SFN);
            }
            for(let i = 0; i < this.currentChest.cards.length; i++) {
                let ix = x+i%5 * 50;
                let iy = y+Math.floor(i/5)*50;
                ctx.strokeStyle = "white";
                ctx.drawImage(image.cards, (this.currentChest.cards[i]-1)*23, 0, 23, 26, (2+ix)*SFN, (2+iy)*SFN, 45*SFN, 45*SFN);
                if(mouse.x > ix && mouse.x < ix + 50 && mouse.y > iy && mouse.y < iy+50) {
                    ctx.strokeStyle = "blue";
                    if(mouse.down && mouse.cycled && this.cards.length < this.maxAmountOfCards) {
                        player.cards.push(this.currentChest.cards[i]);
                        this.currentChest.cards.splice(i,1);
                        mouse.cycled = false;
                    }
                }
                ctx.strokeRect(ix*SFN,iy*SFN,50*SFN,50*SFN);
            }
            //this.inventoryOpen = true;
            this.drawExtraInventory();
        }
        this.currentChest = null;
    }
    drawMessage() {
        if(this.displayMessage != null) {
            let width = this.displayMessage.length*18;
            let x = 500-width/2;
            ctx.fillStyle = "white";
            ctx.fillRect(x*SFN, 300*SFN, width*SFN, 50*SFN);
            ctx.fillStyle = "black";
            ctx.font = `${30*SFN}px Tiny5`;
            ctx.fillText(this.displayMessage, (x+10)*SFN, 330*SFN);
            this.displayMessageTick++;
            if(this.displayMessageTick > 150) {
                this.displayMessage = null;
                this.displayMessageTick = 0;
            }
        }
    }
    drawMachine() {
        if(this.currentMachine != null) {
            if(this.chips >= this.currentMachine.cost || this.currentMachine.played) {
                this.currentMachine.drawGame();
            } else {
                this.currentMachine.drawRejection();
            }
        }
        this.currentMachine = null;
    }
    drawExtraInventory() {
        let x = 400;
        let y = 225;
        let sx = 250;
        let sy = 250;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "black";
        ctx.lineWidth = 1;
        ctx.fillRect(x*SFN,y*SFN,sx*SFN,sy*SFN);
        ctx.restore();
        ctx.font = `${30*SFN}px Tiny5`;
        ctx.fillText("YOUR CARDS (E)", x*SFN,y*SFN);
        for(let i = 0; i < this.cards.length; i++) {
            ctx.strokeStyle = i < 5 ? "gold" : "white";
            ctx.lineWidth = i < 5 ? 2 : 1;
            let ix = x+(i%5 * 50);
            let iy = y+(Math.floor(i/5) * 50);
            if(mouse.x > ix && mouse.x < ix + 50 && mouse.y > iy && mouse.y < iy+50) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "blue";
                if(mouse.down && mouse.cycled) {
                    if(this.selectedCardSwap == null) {
                        this.selectedCardSwap = i;
                    } else {
                        let temp = this.cards[i];
                        this.cards[i] = this.cards[this.selectedCardSwap];
                        this.cards[this.selectedCardSwap] = temp;
                        this.selectedCardSwap = null;
                    }
                    mouse.cycled = false;
                }
            }
            if(this.selectedCardSwap == i) {
                ctx.strokeStyle = "blue";
            }
            ctx.strokeRect(ix*SFN,iy*SFN, 50*SFN, 50*SFN);
            ctx.drawImage(image.cards, (this.cards[i]-1)*23, 0, 23, 26, (2+ix)*SFN,(2+iy)*SFN, 45*SFN, 45*SFN);
        }
        this.drawSidewaysHealthbar(x,y,sx);
    }
    drawSidewaysHealthbar(x,y,size) {
        let bx = x+size;
        let by = y;
        let scaleX = 20;
        let scaleY = 130;
        ctx.fillStyle = "#f5555d";
        ctx.fillRect(bx*SFN,by*SFN,scaleX*SFN,scaleY*SFN);
        ctx.fillStyle = "#d3fc7e";
        ctx.fillRect(bx*SFN,by*SFN,scaleX*SFN,(this.health/this.maxHealth)*130*SFN);
        ctx.drawImage(image.heart, bx*SFN,(by+scaleY/2-10)*SFN,20*SFN,20*SFN);
    }
    updateInventory() {
        if(keys["KeyE"]) {
            if(this.canOpenInventory) {
                this.inventoryOpen = !this.inventoryOpen;
                this.canOpenInventory = false;
            }
        } else {
            this.canOpenInventory = true;
        }
    }
    animate() {
        this.animationTick++;
        if(this.animationTick > this.animationSpeed) {
            if(this.moving) {
                this.frames = 4;
            } else {
                if(this.frameY > 3) {
                    this.frameY-=4;
                    this.frames = 2;
                }
            }
            this.frameX = (this.frameX + 1) % this.frames;
            this.animationTick = 0;
        }
    }
    update() {
        this.input();
        this.movement();
        this.switchRoom();
        this.updateInventory();
    }
    input() {
        this.moving = false;
        if(combatGame == null) {
            if(keys["KeyS"]) {
                this.yVelocity+=this.moveSpeed;
                this.frameY = 4;
                this.moving = true;
            }
            if(keys["KeyW"]) {
                this.yVelocity-=this.moveSpeed;
                this.frameY = 7;
                this.moving = true;
            }
            if(keys["KeyD"]) {
                this.xVelocity+=this.moveSpeed;
                this.frameY = 5;
                this.moving = true;
            }
            if(keys["KeyA"]) {
                this.xVelocity-=this.moveSpeed;
                this.frameY = 6;
                this.moving = true;
            }
        }
    }
    movement() {
        this.x+=this.xVelocity;
        this.y+=this.yVelocity;
        this.xVelocity*=this.friction;
        this.yVelocity*=this.friction;
        this.xVelocity = this.restrictVelocity(this.xVelocity);
        this.yVelocity = this.restrictVelocity(this.yVelocity);
        if(this.moving && Date.now() % 20 == 0) {
            sfx.steps[Math.floor(Math.random() * sfx.steps.length)].play();
        }
    }
    switchRoom() {
        if(this.x+this.size <= 0) {
            this.currentRoom--;
            this.x = 1000-this.size;
        }
        if(this.x >= 1000) {
            this.currentRoom++;
            this.x = 0;
        }
        if(this.y >= 750) {
            this.currentRoom+=map[0].length;
            this.y = 0;
        }
        if(this.y+this.size <= 0) {
            this.currentRoom-=map[0].length;
            this.y = 750-this.size;
        }
    }
    restrictVelocity(vel) {
        if(Math.abs(vel) < 0.1) {
            return 0;
        }
        return vel;
    }
}

var player;
var combatGame;

function initGame() {
    combatGame = null;
    rooms = [];
    player = new Player();
    generateMap();
    createRooms();
}

function randomCard() {
    return Math.floor(Math.random() * 9) + 1;
}