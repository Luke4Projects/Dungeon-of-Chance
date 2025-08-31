class Chest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = tileSize;
        this.cards = [randomCard(), randomCard(), randomCard()];
        this.health = Math.random() < 0.5 ? true : false;
        this.open = false;
    }
    draw() {
        ctx.drawImage(image.chest, this.x*SFN, this.y*SFN, this.size*SFN, this.size*SFN);
    }
    update() {
        let dist = Math.sqrt( Math.pow((this.x-player.x), 2) + Math.pow((this.y-player.y), 2) );   
        if(dist < this.size) {
            player.currentChest = this;
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = tileSize;

        this.level = 5;
        this.setType();
        this.maxHealth = (this.level*5);
        this.health = this.maxHealth;
        this.cards = [];
        for(let i = 0; i < 15; i++) {
            this.cards.push(randomCard());
        }
        this.deadTick = 0;
        this.dead = false;

        this.chips = this.level*3;

        this.frameX = 0;
        this.frameY = this.level-1;
        this.frames = 4;
        this.animationTick = 0;
        this.animationSpeed = 10;
    }
    setType() {
        this.level = 5;
        for(let i = 1; i < 5; i++) {
            if(Math.random() < i/10) {
              break;
            }
            this.level--;
        }
    }
    draw() {
        this.animate();
        if(this.deadTick > 0) {
            this.deadTick--;
            if(this.deadTick % 10 > 4) {
                ctx.save();
                ctx.globalAlpha = this.deadTick/80;
                ctx.drawImage(image.enemy, this.frameX*16, this.frameY*16, 16, 16, this.x*SFN, this.y*SFN, this.size*SFN, this.size*SFN);
                ctx.restore();
            }
            if(this.deadTick < 2) {
                this.dead = true;
            }
        } else {
            ctx.fillStyle = "black";
            ctx.font = `${15*SFN}px Tiny5`;
            ctx.fillText("LEVEL " + this.level, this.x*SFN, (this.y+this.size+15)*SFN);
            ctx.drawImage(image.enemy, this.frameX*16, this.frameY*16, 16, 16, this.x*SFN, this.y*SFN, this.size*SFN, this.size*SFN);
        }
    }
    animate() {
        this.animationTick++;
        if(this.animationTick > this.animationSpeed) {
            this.frameX = (this.frameX + 1) % this.frames;
            this.animationTick = 0;
        }
    }
    update() {
        let dist = Math.sqrt( Math.pow((this.x-player.x), 2) + Math.pow((this.y-player.y), 2) );
        if(dist < this.size*2 && this.health > 0) {
            if(combatGame == null) {
                combatGame = new CombatGame(this);
            }
        }
    }
}

class Machine {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = tileSize;
        this.numbers = [];

        this.usable = true;
        this.usableTick = 0;
        this.cooldown = 300;

        this.cost = 5;

        this.played;
        this.playTick;
        this.inputCard;
        this.outputCard;
        this.chipButtonSize;
        this.reset();
    }
    draw() {
        ctx.drawImage(image.machine, this.x*SFN, this.y*SFN, this.size*SFN, this.size*SFN);
    }
    drawGame() {
        let x = 240;
        let width = 520;
        let y = 50
        let height = 650;
        ctx.fillStyle = "#858585";
        ctx.fillRect(x*SFN,y*SFN,width*SFN,height*SFN);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#5d5d5d";
        ctx.strokeRect(x*SFN,y*SFN,width*SFN,height*SFN);
        ctx.fillStyle = "#ffc825";
        ctx.fillRect((x+width-100)*SFN, (y+height-100)*SFN, 50*SFN, 50*SFN);
        ctx.strokeRect((x+width-100)*SFN, (y+height-100)*SFN, 50*SFN, 50*SFN);
        ctx.fillStyle = "white";
        ctx.fillRect((x+50)*SFN, (y+height-100)*SFN, 200*SFN, 50*SFN);
        ctx.strokeRect((x+50)*SFN, (y+height-100)*SFN, 200*SFN, 50*SFN);
        for(let i = 0; i < this.numbers.length; i++) {
            let nx = x + 50 + i*148;
            let ny = y + 50;
            ctx.fillStyle = "white";
            ctx.fillRect(nx*SFN,ny*SFN,123*SFN,160*SFN);
            ctx.strokeRect(nx*SFN,ny*SFN,123*SFN,160*SFN);
            
            ctx.fillStyle = "#ffc825";
            ctx.font = `${130*SFN}px Tiny5`;
            ctx.fillText(this.numbers[i], (nx+35)*SFN, (ny+110)*SFN);
        }
        ctx.fillStyle = "black";
        ctx.font = `${50*SFN}px Tiny5`;
        ctx.fillText("PLAY 4 BETTER CARD", (x+20)*SFN, (y+40)*SFN);
        if(this.inputCard == null) {
            this.cardSwap(x,y);
        }
        if(player.selectedCardSwap != null) {
            this.inputCard = player.cards[player.selectedCardSwap];
            player.cards.splice(player.selectedCardSwap, 1)
        }
        if(this.inputCard != null && !this.played) {
            this.chipPlayButton(x,y);
        }
        if(this.played) {
            this.playTick++;
            if(this.playTick < 200) {
                if(this.playTick < 100) {
                    this.numbers[0] = Math.floor(Math.random() * 8) + 1;
                }
                if(this.playTick < 150) {
                    this.numbers[1] = Math.floor(Math.random() * 8) + 1;
                }
                if(this.playTick < 200) {
                    this.numbers[2] = Math.floor(Math.random() * 8) + 1;
                }
            }
            if(this.playTick > 200) {
                if(this.playTick < 252) {
                    sfx.machine.play();
                    this.calculateNewCard();
                }
            }
            this.drawOutputCard(x,y);
        }
    }
    drawRejection() {
        ctx.fillStyle = "#c7cfdd";
        ctx.fillRect(220*SFN, 300*SFN, 550*SFN, 50*SFN);
        ctx.fillStyle = "black";
        ctx.font = `${40*SFN}px Tiny5`;
        ctx.fillText("YOU NEED " + this.cost + "    TO USE MACHINE", 220*SFN, 340*SFN);
        ctx.drawImage(image.chip, 430*SFN, 312*SFN, 30*SFN, 30*SFN);
    }
    calculateNewCard() {
        let number = this.inputCard;
        number += this.inputCard >= 5 ? 1 : -1;
        if(this.numbers[0] == this.numbers[1] || this.numbers[0] == this.numbers[2] || this.numbers[1] == this.numbers[2]) {
            number = this.inputCard;
            number += this.inputCard >= 5 ? 3 : -3;
        }
        if(number > 9) {
            number = 9;
        }
        if(number < 1) {
            number = 1;
        }
        this.outputCard = number;
        if(this.numbers[0] == this.numbers[1] && this.numbers[1] == this.numbers[2]) {
            this.outputCard = this.inputCard >= 5 ? 9 : 1;
        }
    }
    drawOutputCard(x,y) {
        let cardX = x+146;
        let cardY = y+340;
        ctx.strokeStyle = "black";
        ctx.font = `${30*SFN}px Tiny5`;
        ctx.fillText("YOUR NEW CARD (CLICK)", (cardX-55)*SFN, cardY*SFN);
        ctx.lineWidth = 3;
        ctx.strokeRect(cardX*SFN, cardY*SFN, 229*SFN, 260*SFN);
        if(this.playTick > 250) {
            if(this.playTick < 350) {
                if(this.playTick % 20 > 10) {
                    ctx.save();
                    ctx.globalAlpha = (this.playTick-250)/100;
                    ctx.drawImage(image.cards, (this.outputCard-1)*23, 0, 23, 26, cardX*SFN, cardY*SFN, 229*SFN, 260*SFN);
                    ctx.restore();
                }
            } else {
                ctx.drawImage(image.cards, (this.outputCard-1)*23, 0, 23, 26, (cardX-this.chipButtonSize/2)*SFN, (cardY-this.chipButtonSize/2)*SFN, (229+this.chipButtonSize)*SFN, (260+this.chipButtonSize)*SFN);
                if(mouse.x > cardX && mouse.x < cardX + 229 && mouse.y > cardY && mouse.y < cardY + 260) {
                    if(this.chipButtonSize < 10) {
                        this.chipButtonSize++;
                    }
                    if(mouse.down) {
                        this.usable = false;
                        player.cards.push(this.outputCard);
                        player.currentMachine = null;
                    }
                } else {
                    if(this.chipButtonSize > 0) {
                        this.chipButtonSize--;
                    }
                }
            }
        }
    }
    cardSwap(x,y) {
        ctx.fillStyle = "#92a1b9";
        ctx.fillRect((x+80)*SFN, (y+110)*SFN, 430*SFN, 50*SFN);
        ctx.fillStyle = "black";
        ctx.font = `${40*SFN}px Tiny5`;
        ctx.fillText("CHOOSE CARD TO SWAP", (x+80)*SFN, (y+150)*SFN);
        player.drawExtraInventory();
    }
    chipPlayButton(x,y) {
        let chipBounce = Math.sin(Date.now()/100)*10;
        let cx = x+200;
        let cy = y+300;
        ctx.drawImage(image.chip, (cx-this.chipButtonSize/2)*SFN, (cy+chipBounce-this.chipButtonSize/2)*SFN, (80+this.chipButtonSize)*SFN, (80+this.chipButtonSize)*SFN);
        ctx.fillStyle = "black";
        ctx.font = `${70*SFN}px Tiny5`;
        ctx.fillText(this.cost, (x+310)*SFN, (y+360)*SFN);

        if(mouse.x > cx && mouse.x < cx + 80 && mouse.y > cy && mouse.y < cy + 80) {
            if(this.chipButtonSize < 10) {
                this.chipButtonSize++;
            }
            if(mouse.down && !this.played) {
                this.played = true;
                player.chips-=this.cost;
            }
        } else {
            if(this.chipButtonSize > 0) {
                this.chipButtonSize--;
            }
        }
    }
    update() {
        let dist = Math.sqrt( Math.pow((this.x-player.x), 2) + Math.pow((this.y-player.y), 2) );
        if(this.usable && dist < this.size && combatGame == null && player.currentChest == null) {
            player.currentMachine = this;
        }
        if(!this.usable) {
            this.usableTick++;
            if(this.usableTick > this.cooldown) {
                this.usable = true;
                this.usableTick = 0;
                this.reset();
            }
        }
    }
    reset() {
        this.inputCard = null;
        this.chipButtonSize = 0;
        this.played = false;
        this.playTick = 0;
        this.outputCard = 1;
        this.numbers = [];
        for(let i = 0; i < 3; i++) {
            this.numbers.push(7);
        }
    }
}