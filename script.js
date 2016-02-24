var grid = {
    initialize: function(options) {
        this.options = options;
        this.inTransition = false;
        this.gridSize = options.gridSize;
        this.numOfTiles = this.gridSize*this.gridSize;
        this.el = options.el;
        this.createTiles();
        this.open = 0;
        this.solved = 0;
        for(var i=0 ; i < this.numOfTiles ; i++) {
            if(this.tiles[i].state === "open") {
                this.open++;
            } else if(this.tiles[i].state === "solved") {
                this.solved++;
            }
        }
        game.updateStatusGrid(this.blocks);
        this.isGameOn();

    },

    isGameOn: function() {
        if(this.solved === this.numOfTiles) {
            game.gameOver();
        }
    },

    tileClicked: function(self) {
        if(self.state === "solved" || this.inTransition === true) {
            return;
        }
        if(self.state === "open") {
            self.flip();
            this.open--;
            this.tiles[self.index].state = "closed";
            this.blocks[self.index].state = "closed";
        } else if(self.state === "closed" && this.open < 2) {
            self.flip();
            this.open++;
            this.tiles[self.index].state = "open";
            this.blocks[self.index].state = "open";
        }
        if(this.open === 2) {
            var index = -1;
            for(var i=0 ; i < this.numOfTiles ; i++) {
                if(this.tiles[i].state === "open" && index === -1) {
                    index = i;
                }
                else if(this.tiles[i].state === "open" && this.tiles[i].val === this.tiles[index].val) {
                    this.tiles[index].solve();
                    this.tiles[i].solve();
                    this.blocks[index].state = "solved";
                    this.blocks[i].state = "solved";
                    this.open = 0;
                    this.solved += 2;
                    this.isGameOn();
                }
                else if(this.tiles[i].state === "open") {
                    break;
                }
            }
            if(this.open) {
                var that = this;
                this.inTransition = true;
                this.blocks[index].state = "closed";
                this.blocks[i].state = "closed";
                this.open = 0;
                setTimeout(function() {
                    that.tiles[index].flip();
                    that.tiles[i].flip();
                    that.inTransition = false;
                }, 1000);
            }
        }
        game.updateStatusGrid(this.blocks);
    },

    shuffle: function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },

    createVals: function() {
        var vals = [];
        for(var i=0;i<this.numOfTiles/2;i++) {
            vals.push(i);
            vals.push(i);
        }
        vals = this.shuffle(vals);
        return vals;
    },

    createTiles: function() {
        this.el.innerHTML = "";
        if(!this.options.blocks) {
            this.vals = this.createVals();
            this.blocks = [];
            for(var i=0;i<this.numOfTiles;i++) {
                this.blocks.push({
                    val: this.vals[i],
                    state: "closed"
                });
            }
        } else {
            this.blocks = this.options.blocks;
        }
        this.tiles = [];
        for(i=0;i<this.numOfTiles;i++) {
            if(i%this.gridSize === 0) {
                this.el.appendChild(document.createElement("br"));
            }
            this.tiles.push(new Tile({
                val: this.blocks[i].val,
                state: this.blocks[i].state,
                grid: this.el,
                index: i
            }));
        }
    }

}

var Tile = function(options) {

    var tile = {

        initialize: function(options) {
            this.options = options;
            this.val = options.val;
            this.index = options.index;
            this.state = typeof options.state ==="undefined" ? "closed" : options.state;//open, closed, solved
            this.createDomElement();
            this.events();
        },

        events: function() {
            var self = this;
            if(this.state !== "solved") {
                this.el.addEventListener('click', function(e) {
                    grid.tileClicked(self);
                });
            }
        },

        flip: function() {
            if(this.state !== "solved") {
                this.el.classList.remove("open");
                this.el.classList.remove("closed");
                if(this.state === "open") {
                    this.state = "closed";
                } else if(this.state === "closed") {
                    this.state = "open";
                }
                this.el.classList.add(this.state);
            }
            return this.state;
        },

        solve: function() {
            this.el.classList.remove("open");
            this.el.classList.remove("closed");
            this.el.classList.add("solved");
            this.state = "solved";
        },

        createDomElement: function() {
            this.el = document.createElement("div");
            this.el.innerHTML = "<span>" + (this.val+1) + "</span>";
            this.el.classList.add("tile");
            this.el.classList.add(this.state);
            this.options.grid.appendChild(this.el);
        }

    };

    tile.initialize(options);
    return tile;
}

var game = {

    initialize: function() {
        this.getDomElements();
        this.events();
        this.getStatus();
        this.startGame();
    },

    events: function() {
        var self = this;
        this.newGameButton.addEventListener('click', function(e) {
            self.newGame();
        });
    },

    getDomElements: function() {
        this.grid = document.getElementsByClassName('grid')[0];
        this.newGameButton = document.getElementsByClassName('newGameButton')[0];
    },

    updateStatusGrid: function(grid) {
        this.status.grid = grid;
        this.setStatus();
    },

    getStatus: function() {
        if(typeof localStorage['rememberMe'] !== "undefined") {
            this.status = JSON.parse(localStorage['rememberMe']);
        } else {
            this.status = {
                gameOn: false,
                grid : null,
                gridSize: 0
            };
            this.setStatus();
        }
    },

    setStatus: function() {
        localStorage['rememberMe'] = JSON.stringify(this.status);
    },

    getGridSize: function() {
        var gridSize = 0;
        while(typeof gridSize !== "number" || gridSize < 2 || gridSize > 8 || gridSize%2 !== 0) {
            gridSize = prompt("How big do you want side of your grid to be? (enter an even number between 2 and 8)");
            gridSize = Number(gridSize);
        }
        return gridSize;
    },

    newGame: function() {
        if(this.status.gameOn === false) {
            this.startGame();
        } else {
            var ans = confirm("Are you sure you want to abandon this game and start another?");
            if(ans === true) {
                this.status.gameOn = false;
                this.startGame();
            }
        }
    },

    startGame: function() {
        if(this.status.gameOn === false) {
            this.status.gridSize = this.getGridSize();
            this.status.gameOn = true;
            this.status.grid = null;
            this.setStatus();
        }
        grid.initialize({
            gridSize: this.status.gridSize,
            el: this.grid,
            blocks: this.status.grid
        });
    },

    gameOver: function() {
        alert("Congratulations. You win!!");
        this.status.gameOn  = false;
        this.setStatus();
    }

}

document.body.onload = function(e) {
    game.initialize();
}
