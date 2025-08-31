class Dice {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50;
        this.value = 1;

        this.hoverSize = 10;
        this.hoverSpeed = 3;
        this.xOffset = 0;
        this.yOffset = 0;
        this.sizeOffset = 0;

        this.rolled = false;
        this.rollTime = 50;
        this.rollTick = 0;
        this.set = false;
    }
    draw() {
        let renderX = this.x+this.xOffset-this.sizeOffset/2;
        let renderY = this.y+this.yOffset-this.sizeOffset/2;
        let renderScale = this.size+this.sizeOffset;
        ctx.drawImage(image.dice, (this.value-1)*9, 0, 9, 9, renderX*SFN,renderY*SFN,renderScale*SFN,renderScale*SFN);
    }
    update() {
        if(mouse.x > this.x && mouse.x < this.x+this.size && mouse.y > this.y && mouse.y < this.y+this.size && !this.set && !this.rolled) {
            if(this.sizeOffset < this.hoverSize) {
                this.sizeOffset+=this.hoverSpeed;
            }
            if(!this.rolled && mouse.down) {
                this.rollTick = 1;
            }
        } else {
            if(this.sizeOffset > 0) {
                this.sizeOffset-=this.hoverSpeed*2;
            }
        }
        if(this.rollTick > 0) {
            this.roll();
        }
    }
    roll() {
        if(this.rollTick < this.rollTime) {
            this.xOffset = Math.sin(this.rollTick);
            this.yOffset = Math.cos(this.rollTick);
            this.value = (this.value + 1) % 7;
            this.rollTick++;
        } else {
            if(!this.set) {
                this.value = Math.floor(Math.random() * 6) + 1;
                this.xOffset = this.yOffset = 0;
                this.set = true;
            }
        }
        this.rolled = true;
    }
}

class Card {
    constructor(x, y, value, enemy = false) {
        this.x = x;
        this.y = y;
        this.scaleX = 88;
        this.scaleY = 100;
        this.value = value;
        this.selected = false;
        this.enemy = enemy;
        this.isHidden = enemy;

        this.hoverSize = 0;
        this.hoverSpeed = 3;
        this.maxHoverSize = 10;
        this.selectionOffset = 0;
        this.maxSelectionOffset = 70;
    }
    draw() {
        if(this.selected) {
            if(this.enemy) {
                if(this.selectionOffset < this.maxSelectionOffset) {
                    this.selectionOffset+=3;
                }
            } else {
                if(this.selectionOffset > -this.maxSelectionOffset) {
                    this.selectionOffset-=3;
                }
            }
        }
        let rx = this.x-this.hoverSize/2;
        let ry = this.y+this.selectionOffset-this.hoverSize/2;
        let sx = this.scaleX+this.hoverSize;
        let sy = this.scaleY+this.hoverSize;
        if(this.isHidden) {
            ctx.drawImage(image.blankCard, rx*SFN, ry*SFN, sx*SFN, sy*SFN);
        } else {
            ctx.drawImage(image.cards, (this.value-1)*23, 0, 23, 26, rx*SFN, ry*SFN, sx*SFN, sy*SFN);
        }
    }
    hover() {
        if(mouse.x > this.x && mouse.x < this.x + this.scaleX && mouse.y > this.y && mouse.y < this.y + this.scaleY) {
            if(this.hoverSize < this.maxHoverSize) {
                this.hoverSize+=this.hoverSpeed;
            }
            if(mouse.down) {
                this.selected = true;
                return true;
            }
        } else {
            if(this.hoverSize > 0) {
                this.hoverSize-=this.hoverSpeed;
            }
        } 
        return false;
    }
}