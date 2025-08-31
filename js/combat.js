const gameStrings = [
    "RISKY CHALLENGER?",
    "ROLL THE DICE",
    "HOW MUCH LIFE DO YOU BET?",
    "MY TURN",
    "CHOSE YOUR CARD",
    "",
    "",
    "YOU WON",
    "YOU LOST!"
];

class CombatGame {
    constructor(enemy) {
        this.enemy = enemy;
        this.position = {x: 200, y: 25};
        this.scale = {x: 600, y: 700};
        this.dice = new Dice(this.position.x+this.scale.x/2 - 25, this.position.y + this.scale.y/2 - 25);

        this.playerCards = [player.cards[0], player.cards[1], player.cards[2]];
        this.cardObjects = [];
        this.createCardSet();
        this.grantedExtraCards = null;
        this.extraText = null;
        this.playedCard = null;
        this.usedPlayerCard = false;

        this.playerBet = null;
        this.makingBet = false;
        this.betButtonOffset = 0;
        this.betMode = false;

        this.usedEnemyCard = false;
        this.enemyCardObjects = [];
        this.enemyPlayedCard = null;
        this.createEnemyCardSet();

        this.cardHoverOffset = 0;
        this.cardHoverMax = 10;
        this.cardHoverSpeed = 2;

        this.playerRenderedHealth = player.health;
        this.enemyRenderedHealth = this.enemy.health;

        this.combatMode = false;
        this.winningCard = "high";

        this.currentString = 0;

        this.tick = 0;

        this.startMusic();
    }
    startMusic() {
        if(!music.isPlaying()) {
            music.play();
        }
    }
    draw() {
        ctx.fillStyle = "#571c27";
        ctx.fillRect(this.position.x*SFN, this.position.y*SFN, this.scale.x*SFN, this.scale.y*SFN);
        ctx.fillStyle = "#501924ff";
        for(let i = 0; i < 8; i++) {
            let offset = Date.now()/10;
            let x = this.position.x + ((i*70) + offset) % (this.scale.x-35);
            ctx.fillRect(x*SFN, this.position.y*SFN, 35*SFN, this.scale.y*SFN);
        }
        ctx.fillStyle = "#3d3d3d";
        ctx.fillRect(this.position.x*SFN, this.position.y*SFN, 35*SFN, this.scale.y*SFN);
        ctx.fillRect((this.position.x+(this.scale.x-35))*SFN, this.position.y*SFN, 35*SFN, this.scale.y*SFN);
        ctx.fillRect((this.position.x-100)*SFN, this.position.y*SFN, 101*SFN, 100*SFN);
        ctx.drawImage(image.enemy, this.enemy.frameX*16, this.enemy.frameY*16, 16, 16, (this.position.x-100)*SFN, this.position.y*SFN, 100*SFN, 100*SFN);
        ctx.fillRect((this.position.x+this.scale.x-1)*SFN, (this.position.y+this.scale.y-100)*SFN, 101*SFN, 100*SFN);
        ctx.drawImage(image.player, 10, 5, 12, 12, (this.position.x+this.scale.x-1)*SFN, (this.position.y+this.scale.y-100)*SFN, 101*SFN, 100*SFN);

        for(let card of this.cardObjects) {
            card.draw();
        }
        for(let card of this.enemyCardObjects) {
            card.draw();
        }

        this.dice.draw();
        this.drawHealthBars();
        if(this.betMode) {
            this.drawBet();
        }
        this.drawText();

    }
    drawText() {
        ctx.fillStyle = "#92a1b9";
        ctx.font = `${30*SFN}px Tiny5`;
        if(this.currentString != null) {
            let renderX = this.position.x + this.scale.x / 2 - (gameStrings[this.currentString].length*7);
            let renderY = this.position.y + this.scale.y / 2 - 30;
            ctx.fillText(gameStrings[this.currentString], renderX*SFN, renderY*SFN)
        }
        ctx.fillStyle = "#c7cfdd";
        if(this.extraText != null) {
            let renderX = this.position.x + this.scale.x / 2 - (this.extraText.length*8);
            let renderY = this.position.y + this.scale.y / 2 + 100;
            ctx.fillText(this.extraText, renderX*SFN, renderY*SFN)
        }
    }
    drawHealthBars() {

        if(this.playerRenderedHealth > player.health) {
            this.playerRenderedHealth--;
        }
        if(this.enemyRenderedHealth > this.enemy.health) {
            this.enemyRenderedHealth--;
        }
        ctx.font = `${25*SFN}px Tiny5`;

        //player
        ctx.lineWidth = 3;
        let x = (this.position.x+this.scale.x/2) - 65;
        let y = this.position.y+this.scale.y-40;
        ctx.fillStyle = "#f5555d";
        ctx.fillRect(x*SFN, y*SFN, 130*SFN, 40*SFN);
        ctx.fillStyle = "#d3fc7e";
        ctx.fillRect(x*SFN, y*SFN, (this.playerRenderedHealth/player.maxHealth)*130*SFN, 40*SFN);
        ctx.fillStyle = "black";
        ctx.fillText(Math.floor(player.health), (x+57)*SFN, (y+26)*SFN);
        ctx.strokeStyle = "black";
        ctx.strokeRect(x*SFN,y*SFN, 130*SFN, 40*SFN);
        // enemy
        y = this.position.y;
        ctx.fillStyle = "#f5555d";
        ctx.fillRect(x*SFN, y*SFN, 130*SFN, 40*SFN);
        ctx.fillStyle = "#d3fc7e";
        ctx.fillRect(x*SFN, y*SFN, (this.enemyRenderedHealth/this.enemy.maxHealth)*130*SFN, 40*SFN);
        ctx.fillStyle = "black";
        ctx.fillText(Math.floor(this.enemy.health), (x+57)*SFN, (y+26)*SFN);
        ctx.strokeRect(x*SFN,y*SFN, 130*SFN, 40*SFN);

    }
    drawBet() {
        let maxBet = (player.health*2 >= player.maxHealth) ? player.maxHealth : player.health*2;
        let betAmount = Math.abs(Math.sin(Date.now()/500) * maxBet);
        ctx.lineWidth = 3;
        let x = (this.position.x+this.scale.x/2) - 65;
        let y = this.position.y+this.scale.y/2+40;
        ctx.fillStyle = "#f5555d";
        ctx.fillRect(x*SFN, y*SFN, 130*SFN, 40*SFN);
        ctx.fillStyle = "#d3fc7e";
        let length = (this.makingBet) ? betAmount/player.maxHealth : this.playerBet/player.maxHealth;
        ctx.fillRect(x*SFN, y*SFN, (length)*130*SFN, 40*SFN);
        if(!this.makingBet) {
            ctx.fillStyle = "black";
            ctx.font = `${30*SFN}px Tiny5`;
            ctx.fillText(this.playerBet, (x+70)*SFN, (y+30)*SFN);
        }
        ctx.strokeStyle = "black";
        ctx.strokeRect(x*SFN,y*SFN, 130*SFN, 40*SFN);

        x = this.position.x+this.scale.x/2-20;
        y = this.position.y+this.scale.y/2+100;
        ctx.drawImage(image.heart, (x-this.betButtonOffset/2)*SFN, (y-this.betButtonOffset/2)*SFN, (40+this.betButtonOffset)*SFN, (40+this.betButtonOffset)*SFN);
        if(mouse.x > x && mouse.x < x + 40 && mouse.y > y && mouse.y < y + 40 && this.makingBet) {
            if(this.betButtonOffset < 10) {
                this.betButtonOffset++;
            }
            if(mouse.down) {
                this.playerBet = Math.round(betAmount);
                this.makingBet = false;
            }
        } else {
            if(this.betButtonOffset > 0) {
                this.betButtonOffset--;
            }
        }

    }
    update() {
        this.dice.update();
        this.grantCards();
        this.updateStrings();
    }
    createCardSet() {
        this.cardObjects = [];
        let cardOffset = (this.playerCards.length > 3) ? 35 : 150;
        for(let i = 0; i < this.playerCards.length; i++) {
            let cardSizeX = 88;
            let cardSizeY = 100;
            let cardX = cardOffset+this.position.x+i*(cardSizeX+22);
            let cardY = this.position.y+this.scale.y-cardSizeY-50;
            
            this.cardObjects.push(new Card(cardX,cardY,this.playerCards[i]));
        }
    }
    createEnemyCardSet() {
        this.enemyCardObjects = [];
        let amount = this.enemy.cards.length < 4 ? this.enemy.cards.length : 3;
        for(let i = 0; i < amount; i++) {
            let cardSizeX = 88;
            let cardX = 150+this.position.x+i*(cardSizeX+22);
            let cardY = this.position.y+50;
            this.enemyCardObjects.push(new Card(cardX, cardY, this.enemy.cards[i], true));
        }
        if(amount <= 0) {
            this.enemy.dead = true;
            combatGame = null;
        }
    }
    grantCards() {
        if(this.dice.set && this.grantedExtraCards == null) {
            let cardsGranted = 0;
            switch(this.dice.value) {
                case 1:
                    cardsGranted = -2;
                    this.playerCards.splice(1);
                    break;   
                case 2:
                    cardsGranted = -1;
                    this.playerCards.splice(2);
                    break;
                case 5:
                    cardsGranted = 1;
                    this.playerCards.push(player.cards[3]);
                    break;
                case 6:
                    cardsGranted = 2;
                    this.playerCards.push(player.cards[3]);
                    this.playerCards.push(player.cards[4]);
                    break;
            }
            this.grantedExtraCards = cardsGranted;
            this.createCardSet();
        }
    }
    chooseHighOrLow() {
        this.dice = new Dice(this.position.x+this.scale.x/2 - 25, this.position.y + this.scale.y/2 - 25);
        this.dice.rollTick = 1;
    }
    updateStrings() {
        switch(this.currentString) {
            case 0: // welcome text (maybe delete)
                this.tick++;
                if(this.tick > 100) {
                    this.currentString++;
                    this.tick = 0;
                }
                break;
            case 1: // wait for dice roll and then display cards granted
                if(this.grantedExtraCards != null) {
                    this.tick++;
                    this.extraText = this.grantedExtraCards +  " CARDS GRANTED";
                    if(this.tick > 300) {
                        this.extraText = null;
                        this.currentString++;
                        this.tick = 0;
                    }
                }
                break;
            case 2: // player makes the bet
                if(this.playerBet != null) {
                    this.makingBet = false;
                    this.tick++;
                    if(this.tick > 150) {
                        this.betMode = false;
                        this.tick = 0;
                        this.currentString++;
                    }
                } else {
                    this.makingBet = true;
                    this.betMode = true;
                }
                break;
            case 3: // the enemy rolls dice to determine whether low or high card will win
                this.tick++;
                if(this.tick > 100) {
                    if(this.tick < 103) {
                        this.chooseHighOrLow();
                    }
                    if(this.tick > 200) {
                        if(this.dice.value < 4) {
                            this.extraText = "LOW CARD WINS";
                            this.winningCard = "low";
                        } else {
                            this.extraText = "HIGH CARD WINS";
                            this.winningCard = "high";
                        }
                        if(this.tick > 500) {
                            this.currentString++;
                            this.tick = 0;
                            this.extraText = null;
                        }
                    }
                }
                break;
            case 4: // the player is able to choose their card
                this.combatMode = true;
                if(this.playedCard == null) {
                    for(let card of this.cardObjects) {
                        if(card.hover()) {
                            this.playedCard = card.value;
                        }
                    }
                } else {
                    this.currentString++;
                }
                break;
            case 5: // the enemy chooses their card, pushes out and flips & winner is chosen
                this.tick++;
                if(this.tick > 100) {
                    let bestCard = this.enemyCardObjects[0];
                    for(let card of this.enemyCardObjects) {
                        if(this.winningCard == "high") {
                            if(card.value > bestCard.value) {
                                bestCard = card;
                            }
                        } else {
                            if(card.value < bestCard.value) {
                                bestCard = card;
                            }
                        }
                    }
                    this.enemyPlayedCard = bestCard;
                    this.enemyPlayedCard.selected = true;
                    this.useCard();
                    if(this.tick > 150) {
                        this.enemyPlayedCard.isHidden = false;
                        if(this.tick > 200) {
                            this.determineWinner();
                            if(this.enemy.health > 0 && player.health > 0) {
                                this.currentString++;
                            }
                            if(player.health < 1) {
                                this.currentString = 8;
                                player.health = 0;
                            }
                            if(player.cards.length <= 0) {
                                this.currentString = 8;
                            }
                            if(this.enemy.health < 1) {
                                this.currentString = 7;
                                this.enemy.health = 0;
                            }
                            this.tick = 0;
                        }
                    }
                }
                break;
            case 6: // reset game
                this.tick++;
                if(this.tick > 150) {
                    this.extraText = null
                    this.reset();
                    this.tick = 0;
                }
                break;
            case 7: // player win
                this.tick++;
                this.extraText = "+ " + this.enemy.chips + " CHIPS";
                if(this.tick < 2) {
                    sfx.win.play();
                }
                if(this.tick > 200) {
                    this.enemy.deadTick = 80;
                    player.chips += this.enemy.chips;
                    player.totalChips += this.enemy.chips;
                    combatGame = null;
                    this.tick = 0;
                }
                break;
            case 8: // enemy win
                this.tick++;
                if(this.tick > 200) {
                    effects.fadeBlack();
                    if(this.tick > 230) {
                        gameState = 2;
                        this.tick = 0;
                    }
                }
                break;
        }
    }
    determineWinner() {
        this.extraText = "TIE";
        if(this.winningCard == "high") {
            if(this.playedCard > this.enemyPlayedCard.value) {
                this.enemy.health -= this.playerBet;
                this.extraText = "SUCCESSFUL ATTACK";
            } else if (this.playedCard < this.enemyPlayedCard.value) {
                player.health -= this.playerBet;
                effects.shake();
                this.extraText = "FAILED ATTACK";
            }
            sfx.hurt.play();
        } else {
            if(this.playedCard > this.enemyPlayedCard.value) {
                player.health -= this.playerBet;
                effects.shake();
                this.extraText = "FAILED ATTACK";
            } else if (this.playedCard < this.enemyPlayedCard.value) {
                this.enemy.health -= this.playerBet;
                this.extraText = "SUCCESSFUL ATTACK";
            }
            sfx.hurt.play();
        }
    }
    useCard() {
        if(!this.usedEnemyCard) {
            for(let i = 0; i < this.enemy.cards.length; i++) {
                if(this.enemy.cards[i] == this.enemyPlayedCard.value) {
                    this.enemy.cards.splice(i,1);
                    this.usedEnemyCard = true;
                    break;
                }
            }
        }
        if(!this.usedPlayerCard) {
            for(let i = 0; i < player.cards.length; i++) {
                if(this.playedCard == player.cards[i]) {
                    player.cards.splice(i,1);
                    this.usedPlayerCard = true;
                    break;
                }
            }
        }
    }
    reset() {
        this.currentString = 1;
        this.playedCard = null;
        this.enemyPlayedCard = null;
        this.grantedExtraCards = null;
        this.dice = new Dice(this.position.x+this.scale.x/2 - 25, this.position.y + this.scale.y/2 - 25);
        this.playerCards = [player.cards[0], player.cards[1], player.cards[2]];
        this.usedPlayerCard = this.usedEnemyCard = false;
        this.playerBet = null;
        this.createCardSet();
        this.createEnemyCardSet();
    }
}