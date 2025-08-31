var image = {
    player: new Image(),
    chest: new Image(),
    enemy: new Image(),
    cards: new Image(),
    dice: new Image(),
    blankCard: new Image(),
    tile: new Image(),
    floor: new Image(),
    heart: new Image(),
    chip: new Image(),
    mainFloor: new Image(),
    machine: new Image(),
    healthPotion: new Image(),
    loadImages: function() {
        this.player.src = "data/player.png";
        this.chest.src = "data/chest.png";
        this.enemy.src = "data/enemy.png";
        this.cards.src = "data/cards.png";
        this.dice.src = "data/dice.png";
        this.blankCard.src = "data/blankCard.png";
        this.tile.src = "data/tile.png";
        this.floor.src = "data/floor.png";
        this.heart.src = "data/heart.png";
        this.chip.src = "data/chip.png";
        this.mainFloor.src = "data/mainFloor.png";
        this.machine.src = "data/machine.png";
        this.healthPotion.src = "data/healthPotion.png";
    }
}

var sfx = {
    hurt: new Audio(),
    win: new Audio(),
    machine: new Audio(),
    click: new Audio(),
    steps: [],
    load: function() {
        this.hurt.src = "data/hurt.wav";
        this.win.src = "data/win.wav";
        this.machine.src = "data/machine.wav";
        this.click.src = "data/click.wav";
        for(let i = 0; i < 3; i++) {
            let saudio = new Audio();
            saudio.src = "data/step" + (i+1) + ".wav";
            saudio.volume = 0.1;
            this.steps.push(saudio);
        }
    }
}

var music = {
    songs: [],
    currentSong: 0,
    loadSongs: function() {
        for(let i = 0; i < 3; i++) {
            let song = new Audio();
            song.src = "data/song" + (i+1) + ".wav";
            song.volume = 0.5;
            this.songs.push(song);
        }
    },
    play: function() {
        this.songs[this.currentSong].play();
        this.currentSong = (this.currentSong + 1) % this.songs.length;
    },
    isPlaying: function() {
        for(let song of this.songs) {
            if(!song.paused) {
                return true;
            }
        }
        return false;
    }
}