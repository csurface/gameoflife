$(function() {

    var c = document.getElementById("game_canvas");
    var ctx = c.getContext("2d");
    var dim = 4;
    var gridw = c.width / dim;
    var gridh = c.height / dim;
    var gridxmin = 0;
    var gridymin = 0;
    var gridxmax = gridw - 1;
    var gridymax = gridh - 1;
    var gridmodel;
    // which index of the pair is active right now
    var modelIndex = 0;
    var ALIVE = 1;
    var DEAD = 0;
    var playing = false;

    function initModel() {
        gridmodel = new Array(gridw);
        for (var x=0; x<gridw; x++) {
            gridmodel[x] = new Array(gridh);
            for (var y=0; y<gridh; y++) {
                gridmodel[x][y] = new Array(DEAD, DEAD);
            }
        }
    }

    function countAlive(gridx, gridy) {
        var a = (gridmodel[gridx][gridy][modelIndex] == ALIVE ? 1 : 0);
        return a;
    }

    function countLiveNeighbors(gridx, gridy) {
        var count = 0;
        if (gridx > gridxmin && gridx < gridxmax &&
            gridy > gridymin && gridy < gridymax)
        {
            count += countAlive(gridx-1, gridy-1);
            count += countAlive(gridx-1, gridy);
            count += countAlive(gridx-1, gridy+1);
            count += countAlive(gridx, gridy-1);
            count += countAlive(gridx, gridy+1);
            count += countAlive(gridx+1, gridy-1);
            count += countAlive(gridx+1, gridy);
            count += countAlive(gridx+1, gridy+1);
        } else {
            if (gridx == gridxmin) {
                if (gridy == gridymin) {
                    count += countAlive(gridx+1, gridy);
                    count += countAlive(gridx+1, gridy+1);
                    count += countAlive(gridx, gridy+1);
                } else if (gridy == gridymax) {
                    count += countAlive(gridx, gridy-1);
                    count += countAlive(gridx+1, gridy-1);
                    count += countAlive(gridx+1, gridy);
                } else {
                    count += countAlive(gridx, gridy-1);
                    count += countAlive(gridx, gridy+1);
                    count += countAlive(gridx+1, gridy-1);
                    count += countAlive(gridx+1, gridy);
                    count += countAlive(gridx+1, gridy+1);
                }
            } else if (gridx == gridxmax) {
                if (gridy == gridymin) {
                    count += countAlive(gridx-1, gridy);
                    count += countAlive(gridx-1, gridy+1);
                    count += countAlive(gridx, gridy+1);
                } else if (gridy == gridymax) {
                    count += countAlive(gridx-1, gridy-1);
                    count += countAlive(gridx-1, gridy);
                    count += countAlive(gridx, gridy-1);
                } else {
                    count += countAlive(gridx, gridy-1);
                    count += countAlive(gridx, gridy+1);
                    count += countAlive(gridx-1, gridy-1);
                    count += countAlive(gridx-1, gridy);
                    count += countAlive(gridx-1, gridy+1);
                }
            } else if (gridy == gridxmin) {
                count += countAlive(gridx-1, gridy);
                count += countAlive(gridx-1, gridy+1);
                count += countAlive(gridx, gridy+1);
                count += countAlive(gridx+1, gridy);
                count += countAlive(gridx+1, gridy+1);
            } else if (gridy == gridymax) {
                count += countAlive(gridx-1, gridy-1);
                count += countAlive(gridx-1, gridy);
                count += countAlive(gridx, gridy-1);
                count += countAlive(gridx+1, gridy-1);
                count += countAlive(gridx+1, gridy);
            } else {
                console.error('unhandled case ('+gridx+','+gridy+')');
            }
        }
        return count;
    }

    function computeCellState(state, liveNeighborCount) {
        var result = state;
        if (state == ALIVE) {
            if (liveNeighborCount < 2) {
                result = DEAD;
            } else if (liveNeighborCount < 4) {
                result = ALIVE;
            } else {
                result = DEAD;
            }
        } else if (state == DEAD && liveNeighborCount == 3) {
            result = ALIVE;
        }
        return result;
    }

    function tickModel() {
        var nextModelIndex = (modelIndex == 0 ? 1 : 0);
        for (var x=0; x<gridw; x++) {
            for (var y=0; y<gridh; y++) {
                var count = countLiveNeighbors(x, y);
                var nextState = computeCellState(gridmodel[x][y][modelIndex], count);
                gridmodel[x][y][nextModelIndex] = nextState;
                if (nextState == ALIVE) {
                    fillCell(x, y);
                } else {
                    clearCell(x, y);
                }
            }
        }
        modelIndex = nextModelIndex;
    }

    function makeCellLive(gridx, gridy) {
        gridmodel[gridx][gridy][modelIndex] = ALIVE;
        fillCell(gridx, gridy);
    }

    function drawGrid() {
        ctx.strokeStyle = "#808080";
        for (var y=dim; y<c.height; y+=dim) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(c.width, y);
            ctx.stroke();
        }
        for (var x=dim; x<c.width; x+=dim) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, c.height);
            ctx.stroke();
        }
    }

    function fillCell(gridx, gridy) {
        if (gridx < gridxmin || gridx > gridxmax ||
            gridy < gridymin || gridy > gridymax)
        {
            return;
        }
        ctx.fillStyle = "black";
        ctx.fillRect(gridx*dim+1, gridy*dim+1, dim-2, dim-2);
    }

    function clearCell(gridx, gridy) {
        ctx.fillStyle = "white";
        ctx.fillRect(gridx*dim+1, gridy*dim+1, dim-2, dim-2);
    }

    function drawPattern(pattern, gridx, gridy) {
        if (pattern == 'Cell') {
            makeCellLive(gridx, gridy);
        } else if (pattern == 'Block') {
            makeCellLive(gridx, gridy);
            makeCellLive(gridx+1, gridy);
            makeCellLive(gridx, gridy+1);
            makeCellLive(gridx+1, gridy+1);
        } else if (pattern == 'Blinker') {
            makeCellLive(gridx-1, gridy);
            makeCellLive(gridx, gridy);
            makeCellLive(gridx+1, gridy);
        } else if (pattern == 'Toad') {
            makeCellLive(gridx+1, gridy);
            makeCellLive(gridx+2, gridy);
            makeCellLive(gridx+3, gridy);
            makeCellLive(gridx, gridy+1);
            makeCellLive(gridx+1, gridy+1);
            makeCellLive(gridx+2, gridy+1);
        } else if (pattern == 'Glider') {
            makeCellLive(gridx, gridy);
            makeCellLive(gridx, gridy+2);
            makeCellLive(gridx+1, gridy+1);
            makeCellLive(gridx+1, gridy+2);
            makeCellLive(gridx+2, gridy+1);
        } else if (pattern == 'Spaceship') {
            makeCellLive(gridx+1, gridy);
            makeCellLive(gridx+2, gridy);
            makeCellLive(gridx, gridy+1);
            makeCellLive(gridx+1, gridy+1);
            makeCellLive(gridx+2, gridy+1);
            makeCellLive(gridx+3, gridy+1);
            makeCellLive(gridx, gridy+2);
            makeCellLive(gridx+1, gridy+2);
            makeCellLive(gridx+3, gridy+2);
            makeCellLive(gridx+4, gridy+2);
            makeCellLive(gridx+2, gridy+3);
            makeCellLive(gridx+3, gridy+3);
        } else if (pattern == 'RPentomino') {
            makeCellLive(gridx+1, gridy);
            makeCellLive(gridx+2, gridy);
            makeCellLive(gridx, gridy+1);
            makeCellLive(gridx+1, gridy+1);
            makeCellLive(gridx+1, gridy+2);
        } else if (pattern == 'Diehard') {
            makeCellLive(gridx+6, gridy);
            makeCellLive(gridx, gridy+1);
            makeCellLive(gridx+1, gridy+1);
            makeCellLive(gridx+1, gridy+2);
            makeCellLive(gridx+5, gridy+2);
            makeCellLive(gridx+6, gridy+2);
            makeCellLive(gridx+7, gridy+2);
        } else if (pattern == 'Acorn') {
            makeCellLive(gridx+1, gridy);
            makeCellLive(gridx+3, gridy+1);
            makeCellLive(gridx, gridy+2);
            makeCellLive(gridx+1, gridy+2);
            makeCellLive(gridx+4, gridy+2);
            makeCellLive(gridx+5, gridy+2);
            makeCellLive(gridx+6, gridy+2);
        }
    }

    function play() {
        if (!playing) {
            playing = true;
            var genCount = 0;
            var ticker = function() {
                if (!playing) return;
                tickModel();
                genCount++;
                $('#gen_count').text(genCount);
                setTimeout(ticker, 400);
            };
            ticker();
        }
    }

    function stop() {
        if (playing) {
            playing = false;
        }
    }

    function initControls() {
        $("#draw").click(function() {
            var pattern = $('#pattern').val();
            var gridx = parseInt($("#gridx").val());
            var gridy = parseInt($("#gridy").val());
            drawPattern(pattern, gridx, gridy);
        });
        $("#play").click(function() {
            play();
        });
        $("#stop").click(function() {
            stop();
        });
    }

    initModel();
    drawGrid();
    initControls();
});
