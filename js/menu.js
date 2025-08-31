class Effects {
    constructor() {
        this.blackFadeTick = 0;
        this.shakeTick = 0;
        this.shakeCoords = {x:0, y:0};
    }
    update() {
        if(this.blackFadeTick >= 1) {
            this.blackFadeTick++;
            if(this.blackFadeTick > 60) {
                this.blackFadeTick = 0;
            }
        }
        if(this.shakeTick > 0) {
            this.shakeCoords.x = Math.cos(this.shakeTick/2)*3;
            this.shakeCoords.y = Math.sin(this.shakeTick/2)*3;
            this.shakeTick++;
            if(this.shakeTick > 50) {
                this.shakeTick = 0;
            }
        }
    }
    draw() {
        if(this.blackFadeTick > 0) {
            ctx.save();
            ctx.globalAlpha = Math.sin(this.blackFadeTick/20);
            ctx.fillStyle = "black";
            ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.restore();
        }
    }
    fadeBlack() {
        this.blackFadeTick = 1;
    }
    shake() {
        this.shakeTick = 1;
    }
}

var startTick = 0;

function fancyBackground() {
    ctx.fillStyle = "#5d5d5d";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#686868ff";
    for(let x = -1; x < 10; x++) {
        let offset = Date.now()/10;
        ctx.fillRect((((x*100 + offset) % 1100)-100)*SFN, 0, 50*SFN, 750*SFN);
    }
}

function playButton(text) {
    let scaleOffset = Math.sin(Date.now()/100);
    ctx.fillStyle = "#657392";
    ctx.fillRect((325-scaleOffset*2)*SFN, (460-scaleOffset*2)*SFN, (350+scaleOffset*4)*SFN, (70+scaleOffset*4)*SFN);
    ctx.font = `${(30+scaleOffset)*SFN}px Tiny5`;
    ctx.fillStyle = "white";
    ctx.fillText(text, (335-scaleOffset*5)*SFN, (500-scaleOffset)*SFN);
    if(mouse.x > 325 && mouse.x < 640 && mouse.y > 460 && mouse.y < 530 && mouse.down && startTick == 0) {
        effects.fadeBlack();
        startTick = 1;
    }
    if(startTick > 0) {
        startTick++;
        if(startTick > 30) {
            gameState = 1;
            initGame();
            startTick = 0;
        }
    }
}

function drawTitleScreen() {
    fancyBackground();
    ctx.fillStyle = "white"
    ctx.font = `${50*SFN}px Tiny5`;
    ctx.fillText("A DUNGEON OF CHANCE", 233*SFN, 200*SFN);
    ctx.font = `${25*SFN}px  Tiny5`;
    ctx.fillStyle = "#b4b4b4";
    ctx.fillText("FIND CARDS, USE THEM AGAINST ENEMIES, GAMBLE FOR MORE CHIPS", 73*SFN, 240*SFN);
    playButton("CLICK TO TAKE THE RISK");
}

function drawDeadScreen() {
    fancyBackground();
    ctx.fillStyle = "white"
    ctx.font = `${50*SFN}px Tiny5`;
    ctx.fillText("YOU TOOK THE RISK", 288*SFN, 200*SFN);
    ctx.font = `${25*SFN}px  Tiny5`;
    ctx.fillStyle = "#b4b4b4";
    if(player.cards.length <= 0) {
        ctx.fillText("YOU RAN OUT OF CARDS AND COULDN'T DEFEND YOURSELF", 182*SFN, 240*SFN);
    } else {
        ctx.fillText("YOU FELL, BUT WILL YOU TAKE THE CHANCE AGAIN?", 230*SFN, 240*SFN);
    }
    ctx.fillText("TOTAL CHIPS: " + player.totalChips, 410*SFN, 280*SFN);
    playButton("CLICK TO TRY IT AGAIN!!!");
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "red";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
}