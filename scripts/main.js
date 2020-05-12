var canvas;
var ctx;
var rect;
var dropSound;
var negateSound;
var bonusSound;
var bonusDropSound;
var mainShiftX = -120;
var mainShiftY = 160;
var keyRows = 13;
var keyDblColumns = 7;
var shift = 2.5;
var HEX_RADIUS = 58;
var HEX_LINE_WIDTH = 10;
var DEFECT_RADIUS = 33;
var TIMED = true;
var PENALTY = true;
var MOUSE_MODE = false;
var SELECT_MODE = true;
var TUTORIAL = true;
var COUNT_ELECTRONS = true;
var DEFECT_LOSS = true;
var SERIES_RESISTOR_MODE = true;
var PBC = true;
var NO_SELECT_FLASH = true;
var HOLD_NAVIGATE = false;
var cursorColour = "#00ff38";
var EXTRA_TUTORIAL = true;
var TIME_LIMIT = 59500;
var RES_ON = 0.4;
var RES_OFF = 5;
var MAX_LOSS_RATE = 575;
var LOSS_POWER = 5;
var MAX_OUTPUT_LIMIT = 200;
var LIMIT_POWER = 5.5;
var maxLumens=2000;
var timeCounter=0;
var gameOver=false;
var startTime;
var currentTime;
var defectCount = 0;
var currentPos = 39;
var chosenOne;
var lossCounter = 0;
var lossWarningLimit = 300;
var lossFlashPeriod = 50;
var finalLumens;
var endCount = 0;
var endCount2 = 0;
var endTime = 200;
var dots;
var endLineWidth = 27;
var previousLumens = 0;
var lumensNow = 1;
var electronCount = 0;
var counter = 0;
var gateCounter = 0;
var outputLimit = 60;
var gateCountLimit = 15;

// Data structures - key bindings, canvas positions, defect boolean: for each site
var balls = [];
var keyCodeList = [];
var buttonX = [];
var buttonY = [];
var defected = [];

var ELECTRON_RADIUS = 18;
var ELECTRON_SPEED = 10;
var BUFFER = 3;
var MAX_DEFECT_FLUCT = 0.4;
var FLUCT_INCRE = 0.02;
var fluctSign = 1;
var gradChange = 0;
var ARE_THERE_NO_DEFECTS = true;
var start2b = false;
var start3a = false;
var start3b = false;
var addition;
var grd;
var grdGold;
var grdTwo;
var gate;
var source;
var drain;
var electrodes;
var wire1;
var wire2a;
var wire2b;
var wire3a;
var wires;
var box1;
var bulb;
var bulbBox;
var lBar;
var heatBar;
var timer;
var endGame;
var finalFont1 = "140px mrrobotregular";
var finalFont2 = "110px mrrobotregular";
var flowBoxFont = "70px mrrobotregular";
var electronBarFont = "70px mrrobotregular";
var timerFont = "70px mrrobotregular";
var bonusAlertFont = "70px mrrobotregular";
var flowBoxLineWidth = 4;
var electrodeLineWidth = 5;
var wireLineWidth = 3;
var bulbBoxLineWidth = 4;
var bulbLineWidth = 3;
var boxLineWidth = 3;
var scoreBarLineWidth = 2;
var timerLineWidth = 2;
// BONUS atom constants 
var BONUS_MODE = true;
var BONUS_FRAC = 0.1;
var BONUS_THRESH = 0.45;
var BONUS_DURATION = 15000;
var BONUS_BAR_WIDTH = 20;
var BONUS_FLASH_PERIOD = 30;
var BONUS_BUFFER_X=300, BONUS_BUFFER_Y=80;
var notify_width=1300, notify_height=90;
// BONUS atom variables
var is_bonus = false;
var bonusCount = 0;
var bonusInit = true;
var bonusTime = 0;
var bonusStartTime = 0;
var bonusDefectPlaced = false;
var soundNotPlayed = true;

window.onload = init;

function init() {
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext('2d');
    rect = canvas.getBoundingClientRect();
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    createScaledElementSizes();
    console.log("window width: " + window.innerWidth 
                + ", window height: " + window.innerHeight);

    dropSound = document.querySelector('#ping');
    negateSound = document.querySelector('#uhuh');
    bonusSound = document.querySelector('#bring');
    bonusDropSound = document.querySelector('#thud');

    for (var l = 0; l < keyRows*keyDblColumns; l++) {
        defected.push(0);
    }
    minLumens = calcLumens();
    maxLumens = determineMaxLumens();

    for ( var i=shift; i < keyDblColumns+shift; i++) {
        for ( var j=0; j<keyRows; j++) {
            buttonX.push((3*i + 1 +1.5*(j % 2))*HEX_RADIUS + rect.left + mainShiftX);
            buttonY.push(j*(Math.sqrt(0.75)*HEX_RADIUS) + HEX_RADIUS + mainShiftY);
        }
    }

    console.log("Defect List Length: " + defected.length
                + "Position List Length: " + buttonX.length);
    console.log("Assigned keys to positions of defects");
    audioPlayer = document.querySelector('#audioPlayer');
    electrodes.forEach(function(electrode) {drawElectrode(electrode);});

    drawHexagonGrid(mainShiftX, mainShiftY);
    if (MOUSE_MODE){
        window.addEventListener('click', listenDropDefectMouse);

    } else if (SELECT_MODE) {
        if (HOLD_NAVIGATE) {
            window.addEventListener('keydown', changeCellSelection);
        } else {
            window.addEventListener('keypress', changeCellSelection);
        }
        window.addEventListener('keypress', dropDefectEnter);
    } else {
        window.addEventListener('keypress', dropDefect);
    }

    console.log("Added listener to canvas");
    startTime = new Date().getTime();

    requestAnimationFrame(animate);
    audioPlayer.play();
    audioPlayer.addEventListener('ended', 
                                 function () { this.currentTime=0; this.play(); },
                                 false);
}

function createScaledElementSizes() {
    //xScale = window.innerWidth;
    yScale = 0.95*window.innerHeight;
	//yScale = 0.51*xScale;
	xScale = 1.96*yScale;
    // continue : divide by 2133 in x direction and 1088 in the y direction
    mainShiftX = -0.056*xScale;
    mainShiftY = 0.147*yScale;
	HEX_RADIUS = 0.0533*yScale;
	HEX_LINE_WIDTH = 0.007*yScale;
	DEFECT_RADIUS = 0.0303*yScale;
	ELECTRON_RADIUS = 0.016*yScale;
	ELECTRON_SPEED = 0.01*yScale;
	finalFont1 = Math.floor(0.1286*yScale) + "px mrrobotregular";
	finalFont2 = Math.floor(0.1011*yScale) + "px mrrobotregular";
	flowBoxFont = Math.floor(0.0843*yScale) + "px mrrobotregular";
	flowBoxLineWidth = Math.floor(0.01*yScale) + "px";
	electronBarFont = Math.floor(0.055*yScale) + "px mrrobotregular";
	timerFont = Math.floor(0.072*yScale) + "px mrrobotregular";
	bonusAlertFont = Math.floor(0.055*yScale) +"px mrrobotregular";
	// BONUS atom constants 
	BONUS_BAR_WIDTH = 0.01838*yScale;
	BONUS_BUFFER_X=0.1406*xScale, BONUS_BUFFER_Y=0.0735*yScale;
	notify_width=0.609*xScale, notify_height=0.0827*yScale;

    gate = {height: 0.055*yScale, 
            width: 0.26*xScale, 
            posX: 0.351*xScale + mainShiftX, 
            posY: 0.615*yScale + mainShiftY};
    source = {height: 0.468*yScale, 
              width: 0.028*xScale, 
              posX:  0.2*xScale + mainShiftX,
              posY : 0.12*yScale + mainShiftY};
    drain = {height: 0.47*yScale, 
             width: 0.028*xScale, 
             posX: 0.78*xScale + mainShiftX, 
             posY: 0.12*yScale + mainShiftY};
    electrodes = [gate, source, drain];

    wire1 = {height: 0.11*yScale, 
             width: 0.145*xScale, 
             posX: -0.002*xScale, 
             posY: 0.32*yScale + mainShiftY, 
             horizon: true, 
             midstart: false};
    wire2a = {height: 0.11*yScale, 
              width: 0.42*xScale,
		      posX: -0.002*xScale, 
		      posY: 0.82*yScale + mainShiftY, 
			  horizon: true, 
			  midstart: false};
    wire2b = {height: 0.14*yScale,
		      width: 0.056*xScale, 
			  posX: wire2a.posX + wire2a.width - 0.03*xScale,
			  posY: gate.posY + gate.height + 0.004*yScale,
              horizon: false, 
			  midstart: false};
    wire3a = {height: 0.11*yScale, 
			  width: 0.47*xScale, 
			  posX: drain.posX + drain.width*1.05,
			  posY: drain.posY + 0.5*drain.height,
              horizon: true, 
			  midstart: true};
    wires = [wire1, wire2a, wire2b, wire3a];

    box1 = {posX: 0.44*xScale + mainShiftX, 
 			posY: 0.81*yScale + mainShiftY, 
			width: 0.07*xScale, 
			height: 0.14*yScale, 
			circRad: 0.01*yScale, 
			circDist: 0.02*yScale,
            innerSquareDist: 0.024*yScale,
			color: '#676767', 
			innerColor:'lightGray'};
    bulb = {posX: drain.posX + 0.15*xScale, 
			posY: drain.posY + 0.02*yScale, 
			coreRadius: 0.11*yScale,
			lightRadius: 0.18*yScale, 
			filRadius: 0.01*yScale};
    bulbBox = {width: 0.078*xScale,
			   height: 0.147*yScale, 
			   shift: 0.037*yScale};
    lBar = {posX: 0.74*xScale, 
			posY: 0.744*yScale, 
			width: 0.31*xScale, 
			height: 0.137*yScale, 
			innerSquareDist: 0.01*xScale,
			outerColor: '#676767',
            innerColor: 'black', 
			textColor:'#03ff14'};
    heatBar = {posX: 0.07*xScale + mainShiftX, 
			   posY: -0.137*yScale + mainShiftY, 
			   width: 0.28*xScale, 
			   height: 0.137*yScale,
			   innerSquareDist: 0.01*xScale,
               outerColor: '#676767',
			   textColor:'#03ff14'};
    timer = {posX: heatBar.posX + heatBar.width, 
			 posY: heatBar.posY, 
			 width: 0.14*xScale, 
			 height: lBar.height,
             innerSquareDist: 0.01*xScale, 
			 outerColor: '#676767', 
			 innerColor: 'black', 
			 dialColor: '#03ff14',
             dialY: heatBar.posY + 0.1*yScale, 
			 dialX: heatBar.posX + 0.96*lBar.width, 
			 dialRad: 0.35*heatBar.height};
    endGame = {posX: 0.187*xScale,
			   posY: 0.165*yScale, 
			   width: 0.562*xScale, 
			   height: 0.735*yScale, 
			   color: 'black', 
			   outline:'#03ff14',
			   outlineDark:'#006400'};
}

function drawElectrode(electrode) {
    grdGold = ctx.createLinearGradient(electrode.posX, 
                                       electrode.posY, 
                                       electrode.posX + electrode.width, 
                                       electrode.posY);
    grdGold.addColorStop("0", 'yellow');
    grdGold.addColorStop("1", '#999a03');

    ctx.strokeStyle = "black";
    ctx.lineWidth = electrodeLineWidth;
    ctx.fillStyle = grdGold;

    ctx.strokeRect(electrode.posX,
                   electrode.posY, 
                   electrode.width, 
                   electrode.height);
    ctx.fillRect(electrode.posX, 
                 electrode.posY, 
                 electrode.width, 
                 electrode.height);
}

function drawHexagonGrid(shiftX=0.0, shiftY=0.0){
    rect = canvas.getBoundingClientRect();
    var width = keyDblColumns;
    var height = keyRows;
    for( var i=shift; i < width+shift; i++) {
        for( var j=0; j<height; j++) {
            drawHexagon(ctx,
                        shiftX + (3*i + 1 + 1.5*(j % 2))*HEX_RADIUS + rect.left, 
                        shiftY + j*(Math.sqrt(0.75)*HEX_RADIUS) + HEX_RADIUS,
                        HEX_RADIUS,
                        "gray");
        }
    }
}

function drawHexagon(ctxt, x, y) {
    var fill = true;
    ctxt.fillStyle = "lightGray";
    ctxt.strokeStyle = "black";
    ctxt.lineWidth = HEX_LINE_WIDTH;
    ctxt.beginPath();
    ctxt.moveTo(x + HEX_RADIUS, y);
    ctxt.lineTo(x + (HEX_RADIUS*0.5), y + (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x - (0.5*HEX_RADIUS), y + (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x - (HEX_RADIUS), y);
    ctxt.lineTo(x - (0.5*HEX_RADIUS), y - (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x + (HEX_RADIUS*0.5), y - (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.closePath();
    if (fill) {
        ctxt.fill();
        ctxt.stroke();
    } else {
      ctxt.stroke();
    }
}

function drawOutline(ctxt, x, y, outline="black") {
    ctxt.strokeStyle = outline;
    ctxt.lineWidth = HEX_LINE_WIDTH;
    ctxt.beginPath();
    ctxt.moveTo(x + HEX_RADIUS, y);
    ctxt.lineTo(x + (HEX_RADIUS*0.5), y + (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x - (0.5*HEX_RADIUS), y + (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x - (HEX_RADIUS), y);
    ctxt.lineTo(x - (0.5*HEX_RADIUS), y - (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x + (HEX_RADIUS*0.5), y - (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.closePath();
    ctxt.stroke();
}

function listenDropDefectMouse(evt) {
    var pos = getMousePosition(evt);
    console.log('clicked at : ' + pos.x + ', ' + pos.y);
    var dist = 10000;
    var key = 0;
    var magDiff;
    for (var i=0; i<defected.length; i++) {
        magDiff = Math.sqrt(Math.pow(pos.x - buttonX[i], 2) 
                  + Math.pow(pos.y-buttonY[i], 2));
        if (magDiff < dist) {
            dist = magDiff;
            key = i;
        }
    }
    if (dist <= HEX_RADIUS) {
        if (defected[key] === 0) {
            grd = ctx.createRadialGradient(buttonX[key], 
                                           buttonY[key],
                                           0.5*DEFECT_RADIUS,
                                           buttonX[key],
                                           buttonY[key],
                                           DEFECT_RADIUS);
            var colorNow = (is_bonus && BONUS_MODE)? "green": "red";
            var defectNumber = (is_bonus && BONUS_MODE)? 2 : 1;
            if (is_bonus && BONUS_MODE) {
                bonusCount += 1;
                is_bonus = false;
            }
            grd.addColorStop(0, colorNow);
            grd.addColorStop(1, "lightGray");
            ctx.fillStyle = grd;
            defected[key] = defectNumber;
            defectCount += 1;
            addition = 0;
            dropSound.play();
        } else if (defected[key] === 1) {
            ctx.fillStyle = "lightGray";
            defected[key] = 0;
            addition = 1;
            defectCount -= 1;
            dropSound.play();
        } else if (defected[key] === 2) {
            negateSound.play();
        }
        ctx.beginPath();
        ctx.arc(buttonX[key], 
                buttonY[key],
                DEFECT_RADIUS + addition,
                0,
                2*Math.PI);
        ctx.fill();
    }
}

function getMousePosition(evt) {
    rect = canvas.getBoundingClientRect();
    return {x: evt.clientX - rect.left, 
            y: evt.clientY - rect.top};
}

function changeCellSelection(evt) {
    var nMod = 13;
    var maxLines=7;
    var bb = currentPos;
    drawOutline(ctx, 
                buttonX[currentPos],
                buttonY[currentPos],
                outline="black");
    var shifter = (Math.floor(bb/nMod) % 2 == 0)? 0: 1;
    var longRow = ((bb + shifter) % 2 == 0);
    switch(evt.charCode) {
        case 119:
            // UP
            if ((currentPos % nMod == 0) || (currentPos % nMod == 1)) {
                var temp = Math.floor(currentPos/nMod)*(nMod) 
                           + nMod - (currentPos%nMod + 1);
                currentPos = (PBC)? temp : currentPos;
            } else {
                currentPos = bb - 2;
            }
            break;
        case 115:
            // DOWN
            if ((currentPos % nMod == nMod - 2) || (currentPos % nMod == nMod - 1)){
                var temp = Math.floor(currentPos/nMod)*(nMod) 
                           + (currentPos%nMod == nMod -2);
                currentPos = (PBC)? temp : currentPos;
            } else {
                currentPos = bb + 2;
            }
            break;
        case 97:
            // LEFT
            if ((currentPos/nMod < 1) && (currentPos % 2 == 0)){
                var correction = (currentPos == 0)? + 1 : -1;
                var temp = (currentPos % nMod) + correction + (maxLines - 1)*nMod;
                currentPos = (PBC)? temp : currentPos;
            } else {
                if (!(currentPos % nMod == 0)) {
                    currentPos = (longRow)? bb - (nMod+1)  : bb + 1;
                } else {
                    currentPos = bb - (nMod-1);
                }
            }
            break;
        case 100:
            // RIGHT
            if ((currentPos/nMod > maxLines - 1) && (currentPos % 2 == 1)) {
                var temp = (currentPos%nMod) + 1;
                currentPos = (PBC)? temp : currentPos;
            } else {
                if (!(currentPos % nMod == 0)) {
                    currentPos = (longRow)? bb - 1 : bb + (nMod+1);
                } else {
                    currentPos = bb + 1;
                }
            }
            break;
        default:
    }
}

function dropDefectEnter(evt) {
    if (evt.keyCode == 13) {
        if (defected[currentPos] === 0) {
            // Fill with a radial gradient to blend with eh background
            grd=ctx.createRadialGradient(buttonX[currentPos], buttonY[currentPos],0.5*DEFECT_RADIUS,buttonX[currentPos],buttonY[currentPos],DEFECT_RADIUS);
            var colorNow = (is_bonus && BONUS_MODE)? "green": "red";
            var defectNumber = (is_bonus && BONUS_MODE)? 2 : 1;
            var soundToPlay = (is_bonus)? bonusDropSound : dropSound;
            if ((is_bonus) && (BONUS_MODE)) {
                bonusCount += 1;
                is_bonus=false;
                bonusDefectPlaced = true;
            }
            grd.addColorStop(0, colorNow);
            grd.addColorStop(1, "lightGray");
            ctx.fillStyle = grd;
            defected[currentPos] = defectNumber;
            defectCount += 1;
            addition = 0;
            soundToPlay.play();
        } else if (defected[currentPos] === 1) {
            // Return the pixels to the background gray;
            ctx.fillStyle = "lightGray";
            defected[currentPos] = 0;
            addition = 1;
            defectCount -= 1;
            dropSound.play();
        } else if (defected[currentPos] === 2) {
            negateSound.play();
        }
        ctx.beginPath();
        ctx.arc(buttonX[currentPos], buttonY[currentPos], DEFECT_RADIUS+addition, 0, 2*Math.PI);
        ctx.fill();
    }

}

function animate(){
    wires.forEach( function(wire) { drawWire(wire) });
    if (defectCount < 0) { defectCount = 0; }
    if ((counter++ > outputLimit) && (defectCount > 0)) {
        createBall(wire1);
        if(start3a) {
            createBall(wire3a);}
        counter = 0;
    }
    if (gateCounter++ > gateCountLimit) {
        createBall(wire2a);
        if(start2b) {createBall(wire2b);}
        gateCounter = 0;
    }
    pulseDefects();
    ctx.lineWidth = HEX_LINE_WIDTH;
    var colorMe;
    if (SELECT_MODE) {
        if ((Math.floor(timeCounter/10)%2 == 0) || (NO_SELECT_FLASH)){
            colorMe = cursorColour;
        } else {
            colorMe = 'black';
        }
        drawOutline(ctx, buttonX[currentPos], buttonY[currentPos], outline=colorMe);
    }
    if (DEFECT_LOSS) {
        if (lossCounter == lossWarningLimit) {
            chosenOne = chooseDefectToGo();
        }
        if (lossCounter > lossWarningLimit) {
            if (Math.floor(lossCounter/10)%2 === 1) {
                colorYou = 'red';
            } else {
                colorYou = 'black';
            }
            drawOutline(ctx, buttonX[chosenOne], buttonY[chosenOne], outline=colorYou);
        }
        if (lossCounter++ > lossWarningLimit+lossFlashPeriod) {
            while(defected[chosenOne] == 2) {
                drawOutline(ctx, buttonX[chosenOne], buttonY[chosenOne], outline="black");
                chosenOne = chooseDefectToGo();
            }
            deleteDefect(chosenOne);
            defectCount -= 1;
            drawOutline(ctx, buttonX[chosenOne], buttonY[chosenOne], outline="black");
            lossCounter=0;
        }
    }
    // self-explanatory
    checkCollision();
    moveBalls();
    drawBox(box1);
    drawBulbBox();
    lumensNow = calcLumens();
    if (lumensNow < minLumens) {
        lumensNow = minLumens;
    }

    outputLimit = MAX_OUTPUT_LIMIT*Math.pow((1 - (lumensNow/maxLumens)), LIMIT_POWER) - bonusCount*MAX_OUTPUT_LIMIT*BONUS_FRAC;
    lossWarningLimit = lossFlashPeriod + Math.floor(MAX_LOSS_RATE*Math.pow((1 - (defectCount/keyRows/keyDblColumns)), LOSS_POWER));
    // Only redraws the bulb if lumens changes
    if (previousLumens !== lumensNow) {
        drawBulb();
        drawHeatBar();
    }
    if ((!COUNT_ELECTRONS) && (previousLumens !== lumensNow)) {
        drawScoreBar();
    } else if (COUNT_ELECTRONS) {
        drawScoreBar();
    }
    previousLumens = lumensNow;
    if (TIMED) {
        timeCounter++;
        currentTime = new Date().getTime();
        drawTimer();
        // Current state of the game i.e. time and lumens
        var difference = currentTime - startTime;
        var frac = (lumensNow-minLumens)/(maxLumens-minLumens);
        // Deal with bonus atom
        if (BONUS_MODE) {
            bonusTime = new Date().getTime();
            // Below are the variable necessary for the bonus graphics
            var diff = bonusTime-bonusStartTime;
            var timeLeft = 15-Math.floor((diff+1)/1000);
            if (timeLeft < 0) {
                timeLeft = 0;
            } else if (timeLeft > 15) {
                timeLeft = 15;
            }
            var bonusText = "BONUS! Keep flux high: "+ timeLeft;
            var notify_x=heatBar.posX+heatBar.innerSquareDist + heatBar.width + BONUS_BUFFER_X;
            var notify_y=heatBar.posY+heatBar.innerSquareDist;

            if ((frac >= BONUS_THRESH) && !(bonusInit)) {
                // If we initially cross the threshold, need to starth the DURATION timer
                bonusInit = true;
                soundNotPlayed=true;
                bonusStartTime = new Date().getTime();
            } else if (frac < BONUS_THRESH) {
                // If we dip back below the THRESHOLD, we need to reset the clock
                bonusInit = false;
            }
            // Clearing the region where the bonus text appears so it can be refreshed.
            ctx.clearRect(notify_x, notify_y, notify_width, notify_height);

            if (bonusInit) {
                // Draw White bar on the heat bar to indicate the benchmark
                // and draw some text next t the heat bar to indicate the time remaining
                if (bonusTime-bonusStartTime > BONUS_DURATION) {
                    // If the user passes the threshold, the screen will flash bonus and
                    // the user will have to place an atom down.
                    is_bonus = true;
                    //bonusInit = false;
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'black';
					ctx.font = bonusAlertFont;
                    var notification = "YOU WON A STRONGER BONUS ATOM!";
                    if (soundNotPlayed) {
                        bonusSound.play();
                        soundNotPlayed=false;
                    }
//                  bonusSound.play();
                    ctx.fillText(notification, heatBar.posX+heatBar.innerSquareDist + heatBar.width + BONUS_BUFFER_X,
                            heatBar.posY+heatBar.innerSquareDist + BONUS_BUFFER_Y);
                    ctx.strokeText(notification, heatBar.posX+heatBar.innerSquareDist + heatBar.width + BONUS_BUFFER_X,
                            heatBar.posY+heatBar.innerSquareDist + BONUS_BUFFER_Y);
                    if (bonusDefectPlaced) {
                        bonusInit = false;
                        is_bonus = false;
                        bonusDefectPlaced=false;
                    }
                } else {
                    // Until the duration has exceeded, the interface will tell the user
                    // how many seconds they have to keep the flow above the threshold for
                    ctx.fillStyle = 'white';
					ctx.font = bonusAlertFont;
                    ctx.strokeStyle = 'black';
                    ctx.fillRect(heatBar.posX+heatBar.innerSquareDist + (heatBar.width-2*heatBar.innerSquareDist)*Math.sqrt(BONUS_THRESH),
                            heatBar.posY+heatBar.innerSquareDist, BONUS_BAR_WIDTH, heatBar.height-2*heatBar.innerSquareDist);

                    if ((Math.floor(timeCounter/BONUS_FLASH_PERIOD))%2 == 0) {
                        ctx.fillText(bonusText, heatBar.posX+heatBar.innerSquareDist + heatBar.width + BONUS_BUFFER_X,
                                heatBar.posY+heatBar.innerSquareDist + BONUS_BUFFER_Y);
                        ctx.strokeText(bonusText, heatBar.posX+heatBar.innerSquareDist + heatBar.width + BONUS_BUFFER_X,
                                heatBar.posY+heatBar.innerSquareDist + BONUS_BUFFER_Y);
                    }
                }
            }
        }
        if (Math.abs(difference) > TIME_LIMIT){
            endSequence();
        } else {
            requestAnimationFrame(animate);
        }
    } else {
        timeCounter++;
        requestAnimationFrame(animate);
    }
}

function pulseDefects() {
    // Determine point in the fluctuation which is done by the defect radius
    // of the gradient, constantly changing, where MAX_DEFECT_FLUCT determines
    // the speed of fluctuating defectsi
    if ( gradChange < -MAX_DEFECT_FLUCT) {
        fluctSign = 1;
    } else if (gradChange > MAX_DEFECT_FLUCT) {
        fluctSign = -1;
    }
    gradChange += fluctSign*FLUCT_INCRE;
    var gradFrac = 0.5 + gradChange;

    for (var i =0; i < defected.length ; i++ ) {
        if (defected[i] == 1) {
            grd = ctx.createRadialGradient(buttonX[i],
                                           buttonY[i],
                                           gradFrac*DEFECT_RADIUS,
                                           buttonX[i],
                                           buttonY[i],
                                           DEFECT_RADIUS);
            grd.addColorStop(0, "red");
            grd.addColorStop(1, "lightGray");
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(buttonX[i], buttonY[i], DEFECT_RADIUS, 0, 2*Math.PI);
            ctx.fill();
        } else if (defected[i] === 2) {
            grd = ctx.createRadialGradient(buttonX[i],
                                           buttonY[i],
                                           gradFrac*DEFECT_RADIUS,
                                           buttonX[i],
                                           buttonY[i],
                                           DEFECT_RADIUS);
            grd.addColorStop(0, "green");
            grd.addColorStop(1, "lightGray");
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(buttonX[i], buttonY[i], DEFECT_RADIUS, 0, 2*Math.PI);
            ctx.fill();

        }
    }
}

// MK_WIRES

function drawWire(wire) {
    if (wire.horizon) {
        ctx.clearRect(wire.posX, 
                      wire.posY - ELECTRON_RADIUS, 
                      wire.width + BUFFER, wire.height + (2*ELECTRON_RADIUS));
        grd = ctx.createLinearGradient(wire.posX, 
                                       wire.posY,
                                       wire.posX, 
                                       wire.posY + wire.height);
    } else {
        ctx.clearRect(wire.posX - ELECTRON_RADIUS, 
                      wire.posY - BUFFER,
                      wire.width + (2*ELECTRON_RADIUS) + BUFFER, 
                      wire.height + BUFFER);
        grd = ctx.createLinearGradient(wire.posX,
                                       wire.posY, 
                                       wire.posX + wire.width,
                                       wire.posY);
    }
    grd.addColorStop(0, "#474747");
    grd.addColorStop(0.5, "lightGray");
    grd.addColorStop(1, "#474747");
    ctx.fillStyle = grd;
    ctx.strokeStyle = "black";
    ctx.lineWidth = wireLineWidth;
    ctx.strokeRect(wire.posX, wire.posY, wire.width, wire.height);
    ctx.fillRect(wire.posX, wire.posY, wire.width, wire.height);
}


function drawBox(box) {
    ctx.clearRect(box.posX, box.posY, box.width, box.heigh);
    ctx.fillStyle = box.color;
    ctx.strokeStyle = "black";
    ctx.linewidth = boxLineWidth;;

    // Outer shape
    ctx.strokeRect(box.posX, box.posY, box.width, box.height);
    ctx.fillRect(box.posX, box.posY, box.width, box.height);

    // Internal Decoration
    ctx.fillStyle = box.innerColor
    for (var i2=0; i2 < 2; i2++ ){
        for (var j2=0; j2 < 2 ; j2++) {
        ctx.beginPath();
        ctx.arc(box.posX + box.circDist + i2*(box.width - 2*box.circDist), 
                box.posY + box.circDist + j2*(box.height - 2*box.circDist),
                box.circRad, 0, 2*Math.PI);
        ctx.fill();
        }
    }
    ctx.fillRect(box.posX + box.innerSquareDist, 
                 box.posY + box.innerSquareDist,
                 box.width - 2*box.innerSquareDist, 
                 box.height - 2*box.innerSquareDist);
}

function createBall(wire) {
    var ball = {
        r: ELECTRON_RADIUS,
        x: (wire.horizon)? wire.posX + 4 : wire.posX + (wire.width*0.5) + (0.5*Math.random()*(wire.width - ELECTRON_RADIUS - 2)),
        y: (wire.horizon)? wire.posY+(wire.height*0.5)+(0.5*Math.random()*(wire.height-ELECTRON_RADIUS-2)) : wire.posY+wire.height,
        speedX: (wire.horizon)? ELECTRON_SPEED : (Math.random()*0.5 - 0.25)*ELECTRON_SPEED ,
        speedY: (wire.horizon)? (Math.random()*0.5 - 0.25)*ELECTRON_SPEED: -ELECTRON_SPEED,
        wirename: wire, uncounted:true
    };
    if (wire.midstart) { 
        ball.x = ball.x + 3.5*BUFFER;
    }
    balls.push(ball);
}

function checkCollision() {
    balls.forEach(function (b) {
            if (COUNT_ELECTRONS){
                if (b.uncounted && (b.x > bulb.posX)) {
                    electronCount+=1;
                    b.uncounted=false;
                }
            }
            if (b.wirename.horizon) {
                    if (b.y+b.r > b.wirename.posY + b.wirename.height+BUFFER) {
                        b.speedY = -Math.abs(b.speedY);
                    } else if  (b.y-b.r < b.wirename.posY-BUFFER ) {
                        b.speedY = Math.abs(b.speedY);
                    }
                    if (b.x + b.r > b.wirename.posX + b.wirename.width-BUFFER) {
                        // if it reachs the end of the wire, obliterate it.
                        var indOf = balls.indexOf(b);
                        balls.splice(indOf, 1);
                        if ((b.wirename == wire2a) && !(start2b)){
                            start2b = true;
                        }
                        if ((b.wirename == wire1) && !(start3a)) {
                            start3a = true;
                        }
                    }
            } else {
                    if (b.x+b.r > b.wirename.posX + b.wirename.width+BUFFER) {
                        b.speedX = -Math.abs(b.speedX);
                    } else if (b.x-b.r < b.wirename.posX-BUFFER ) {
                        b.speedX = Math.abs(b.speedX);
                    }
                    if (b.y - b.r < b.wirename.posY + (0*b.wirename.height) - BUFFER) {
                        // if it reachs the end of the wire, obliterate it.
                      var indOf = balls.indexOf(b);
                      balls.splice(indOf, 1);
                    }
            }
            });
}

function moveBalls(){
    balls.forEach( 
        function (b) {
            var gradient = ctx.createLinearGradient(b.x - b.r, b.y, b.x + b.r, b.y);
            gradient.addColorStop("0", '#23ecfd');
            gradient.addColorStop("1.0", '#007dc9');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, 2*Math.PI);
            ctx.fill();
            b.x += b.speedX;
            b.y += b.speedY;
        }
    );
}

function drawBulb() {
    grd = ctx.createRadialGradient(bulb.posX, bulb.posY, 0, bulb.posX, bulb.posY, bulb.lightRadius);
    var luFrac = lumensNow/maxLumens;
    // Two gradient colours for the light bulb make it look realistic white and cream
    grd.addColorStop(((1-Math.pow(2.71828, -luFrac))/(1-Math.pow(2.71828, -1)))*0.9*0.6, 'white');
    grd.addColorStop(((1-Math.pow(2.71828, -luFrac))/(1-Math.pow(2.71828, -1)))*0.9, '#fff594');
    // light from bulb fades into the background
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle=grd;
    ctx.lineWidth = bulbLineWidth;
    ctx.clearRect(bulb.posX -bulb.lightRadius, bulb.posY-bulb.lightRadius, 2*bulb.lightRadius, (1+Math.sqrt(0.75))*bulb.lightRadius+bulbBox.shift-12)
    ctx.beginPath();
    ctx.arc(bulb.posX, bulb.posY, bulb.lightRadius, 0, 2*Math.PI);
    ctx.closePath();
    //ctx.arc(bulb.posX, bulb.posY, bulb.lightRadius, 0, 2*Math.PI);
    if (ARE_THERE_NO_DEFECTS) {
        //do nothing, not light at all
    } else {
        ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(bulb.posX-0.5*bulb.coreRadius, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius);
    ctx.lineTo(bulb.posX-0.5*bulb.coreRadius, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.coreRadius);
    ctx.arc(bulb.posX, bulb.posY, bulb.coreRadius, (2./3)*Math.PI, (1./3)*Math.PI);
    ctx.lineTo(bulb.posX+0.5*bulb.coreRadius, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bulb.posX-0.1*bulb.coreRadius, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius);
    ctx.lineTo(bulb.posX-3*bulb.filRadius, bulb.posY);
    ctx.arc(bulb.posX-3*bulb.filRadius+bulb.filRadius, bulb.posY, bulb.filRadius, Math.PI, 2*Math.PI);
    ctx.arc(bulb.posX-3*bulb.filRadius+3*bulb.filRadius, bulb.posY, bulb.filRadius, 0, Math.PI);
    ctx.arc(bulb.posX-3*bulb.filRadius+5*bulb.filRadius, bulb.posY, bulb.filRadius, Math.PI, 2*Math.PI);
    ctx.lineTo(bulb.posX+0.1*bulb.coreRadius, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius);
    ctx.closePath();
    ctx.stroke();
}


function drawBulbBox() {
    ctx.lineWidth = bulbBoxLineWidth;
    //var luFrac = lumensNow/maxLumens;
    var frac = Math.sqrt((lumensNow-minLumens)/(maxLumens-minLumens));
    var colBox = "#333333";
    if (ARE_THERE_NO_DEFECTS) {
        grdTwo = ctx.createLinearGradient(bulb.posX, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius, bulb.posX, bulb.posY+Math.sqrt(0.75)*bulb.lightRadius+bulbBox.height);
        grdTwo.addColorStop(0, colBox);
        grdTwo.addColorStop(1.0, "black");
    } else {
        grdTwo = ctx.createLinearGradient(bulb.posX, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius, bulb.posX, bulb.posY+Math.sqrt(0.75)*bulb.lightRadius+bulbBox.height);
        grdTwo.addColorStop(0,'lightGray');
        grdTwo.addColorStop(0.5*(frac+0.8), colBox);
        grdTwo.addColorStop(1.0, "black");
    }
    // console.log(lumensNow);
    ctx.fillStyle = grdTwo;
    ctx.strokeStyle = "black";
    ctx.fillRect(bulb.posX-0.5*bulb.lightRadius, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius, bulb.lightRadius, bulbBox.height);
    ctx.strokeRect(bulb.posX-0.5*bulb.lightRadius, bulb.posY+bulbBox.shift+Math.sqrt(0.75)*bulb.lightRadius, bulb.lightRadius, bulbBox.height);
}


function drawScoreBar() {
    // Outer Box
    ctx.fillStyle = lBar.outerColor;
    ctx.strokeStyle = "black";
    ctx.lineWidth = scoreBarLineWidth;
    ctx.fillRect(lBar.posX, lBar.posY, lBar.width, lBar.height);
    ctx.strokeRect(lBar.posX, lBar.posY, lBar.width, lBar.height);
    // inner Box
    ctx.fillStyle = lBar.innerColor;
    ctx.fillRect(lBar.posX+lBar.innerSquareDist, lBar.posY+lBar.innerSquareDist, lBar.width-2*lBar.innerSquareDist, lBar.height-2*lBar.innerSquareDist);
    // live text
    ctx.fillStyle = lBar.textColor;
    ctx.font = electronBarFont;
    if (COUNT_ELECTRONS) {
        ctx.fillText("Electrons: " + electronCount, lBar.posX+2*lBar.innerSquareDist, lBar.posY+4.8*lBar.innerSquareDist);
    } else {
        ctx.fillText(lumensNow + " L", lBar.posX+2*lBar.innerSquareDist, lBar.posY+5*lBar.innerSquareDist);
    }
}

function calcLumens() {
    var sumOdd = 0
    var sumEven = 0;
    var resTot = 0;
    var noneCheck = true;
    for (var l=0; l < keyDblColumns*keyRows; l++){
        if ((l % keyRows === 0) && (l !== 0)) {
            if (SERIES_RESISTOR_MODE) {
                resTot += 1./(sumOdd + sumEven);
            } else {
                resTot += 1./sumOdd + 1./sumEven;
            }
            sumOdd = 0;
            sumEven = 0;
        }
        var reduceFactor = 1;
        if (PENALTY) {
            var neighList = neighbourList(l);
            neighList.forEach(function (site) { if (defected[site]) {reduceFactor *= 2;}});
        }
        var siteRes = (defected[l])? reduceFactor*RES_ON : RES_OFF ;
        if (defected[l]) {
            noneCheck=false;
        }
        if (l%2 === 0) {
            sumEven += 1./siteRes;
        } else {
            sumOdd += 1./siteRes;
        }
    }

    if (SERIES_RESISTOR_MODE) {
        resTot += 1./(sumOdd + sumEven);
    } else {
        resTot += 1./sumOdd + 1./sumEven;
    }
    ARE_THERE_NO_DEFECTS = noneCheck;
    return Math.round(1000./resTot);

}

function determineMaxLumens() {
    var sumOdd=0, sumEven=0;
    var totalResistance=0;
    for (var l=0; l < keyDblColumns*keyRows; l++){
        if ((l%keyRows === 0) && (l !== 0)) {
            if (SERIES_RESISTOR_MODE) {
                totalResistance += 1./(sumOdd + sumEven);
            } else {
                totalResistance += 1./sumOdd + 1./sumEven;
            }
            sumOdd = 0;
            sumEven = 0;
        }
        var reduceFactor = 1;
        var siteRes = ((l % keyRows) % 3 == 0) ? reduceFactor*RES_ON : RES_OFF;
        if (l%2 === 0) {
            sumEven += 1./siteRes;
        } else {
            sumOdd += 1./siteRes;
        }
    }
    if (SERIES_RESISTOR_MODE) {
        totalResistance += 1./(sumOdd + sumEven);
    } else {
        totalResistance += 1./sumOdd + 1./sumEven;
    }
    return Math.round(1000./totalResistance);
}

function neighbourList(site) {
    var nList;
    var colNum = Math.floor(site/keyRows);
    var siteEven = ((site - colNum*keyRows) % 2 === 0);
    var parity = (siteEven)? -1.0 : 1.0;
    var topBoundary = ((site % keyRows === 0) || (site % keyRows == 1))? 1: 0;
    var bottomBoundary = ((site % keyRows === keyRows - 1) || 
                 (site % keyRows === keyRows - 2)) ? 1 : 0;
    var leftBoundary = ((site < keyRows) && (siteEven))? 1 : 0;
    var rightBoundary= ((site >= keyRows*(keyDblColumns - 1)) && 
                 ((site-colNum*keyRows) % 2 === 1))? 1 : 0;
    if (topBoundary) {
        // deals with top boundary and top corners too
        nList = [site + 2];
        if (!rightBoundary) { 
            nList.push( (siteEven)? site + 1 : site + keyRows - 1);
            if (!siteEven) { nList.push(site + keyRows + 1); } 
        }
        if (!leftBoundary) { 
            nList.push( (siteEven)? site - keyRows + 1: site - 1);
            if (!siteEven) { nList.push(site + 1); } 
        }
    } else if (bottomBoundary) {
        // deals with bottom boundary and bottom corners too
        nList = [site - 2];
        if (!rightBoundary) { 
            nList.push( (siteEven)? site - 1 : site + keyRows + 1);
            if (!siteEven) { nList.push(site + keyRows - 1); } 
        }
        if (!leftBoundary) { 
            nList.push( (siteEven)? site - keyRows + 1: site + 1);
            if (!siteEven) { nList.push(site - 1); } 
        }
    } else if (leftBoundary || rightBoundary) {
        // non-corner left side
        nList = [site - 2, site + 2, site + 1, site - 1];
    } else {
        // non-boundary sites
       nList = [site - 1, site + 1, site + 2, site - 2, 
                site + (parity*keyRows) + 1, site + (parity*keyRows) - 1];
    }
    return nList;
}

function drawHeatBar(){
    ctx.font = flowBoxFont;
    ctx.fillStyle = heatBar.outerColor;
    ctx.strokeStyle = "black"
    ctx.lineWidth = flowBoxLineWidth;
    ctx.fillRect(heatBar.posX, heatBar.posY, heatBar.width, heatBar.height);
    ctx.strokeRect(heatBar.posX, heatBar.posY, heatBar.width, heatBar.height);
    ctx.fillStyle = "black";
    ctx.fillRect(heatBar.posX + heatBar.innerSquareDist,
                 heatBar.posY + heatBar.innerSquareDist,
                 heatBar.width - 2*heatBar.innerSquareDist,
                 heatBar.height - 2*heatBar.innerSquareDist);
    var frac = (lumensNow - minLumens)/(maxLumens - minLumens);
    if ((BONUS_MODE) && (frac >= BONUS_THRESH)) {
        grd = ctx.createLinearGradient(heatBar.posX, 
                                       heatBar.posY, 
                                       heatBar.posX + heatBar.width,
                                       heatBar.posY);
        grd.addColorStop(0.0, "black");
        grd.addColorStop(0.4, "orange");
        grd.addColorStop(0.7, "red");
    } else {
        grd = ctx.createLinearGradient(heatBar.posX, 
                                       heatBar.posY, 
                                       heatBar.posX + heatBar.width,
                                       heatBar.posY);
        grd.addColorStop(0, "#6600cc");
        grd.addColorStop(0.1, "blue");
        grd.addColorStop(0.2, "green");
        grd.addColorStop(0.4, "yellow");
        grd.addColorStop(0.7, "orange");
        grd.addColorStop(1.0, "red");
    }
    ctx.fillStyle = grd;
    var frac = Math.sqrt((lumensNow - minLumens)/(maxLumens - minLumens));
    var visualThresh = Math.sqrt(BONUS_THRESH);
    if (frac > 1) {
        frac = 1;
    }
    ctx.fillRect(heatBar.posX + heatBar.innerSquareDist, 
                 heatBar.posY + heatBar.innerSquareDist, 
                 (heatBar.width - 2*heatBar.innerSquareDist)*frac,
                 heatBar.height - 2*heatBar.innerSquareDist);
    // Trying to animate the bonus
    ctx.fillStyle = "white";
    ctx.fillText("FLUX", 
                 heatBar.posX + heatBar.width*0.08,
                 heatBar.posY + heatBar.innerSquareDist + 0.6*heatBar.height);
    ctx.strokeText("FLUX",
                   heatBar.posX + heatBar.width*0.08, 
                   heatBar.posY + heatBar.innerSquareDist + 0.6*heatBar.height);
}

function chooseDefectToGo() {
    var potentialCandidates = [];
    for (var i=0; i < keyRows*keyDblColumns; i++) {
        if (defected[i] == 1) {
            potentialCandidates.push(i);
        }
    }
    return potentialCandidates[Math.floor(Math.random()*potentialCandidates.length)];
}

function deleteDefect(site) {
    ctx.fillStyle = "lightGray";
    defected[site] = 0;
    addition = 1;
    ctx.beginPath();
    ctx.arc(buttonX[site], 
            buttonY[site], 
            DEFECT_RADIUS + addition,
            0,
            2*Math.PI);
    ctx.fill();
}

function drawTimer() {
	ctx.font = timerFont;
    ctx.fillStyle = timer.outerColor;
    ctx.strokeStyle = "black";
    ctx.lineWidth = timerLineWidth;
    ctx.fillRect(timer.posX, timer.posY, timer.width, timer.height);
    ctx.strokeRect(timer.posX, timer.posY, timer.width, timer.height);
    ctx.fillStyle = timer.innerColor;
    ctx.fillRect(timer.posX + timer.innerSquareDist,
                 timer.posY + timer.innerSquareDist, 
                 timer.width - 2*timer.innerSquareDist,
                 timer.height - 2*timer.innerSquareDist);
    ctx.fillStyle = timer.dialColor;
    var timeInBox = Math.floor((TIME_LIMIT - currentTime + startTime)/1000)
    if (timeInBox < 0) { timeInBox = 0; }
    if (timeInBox < 10) {
        ctx.fillText("00:0" + timeInBox, timer.dialX, timer.dialY);
    } else {
        ctx.fillText("00:" + timeInBox, timer.dialX, timer.dialY);
    }
}

function endSequence() {
    gameOver = true;
    if (MOUSE_MODE) {
        window.removeEventListener('click', listenDropDefectMouse);
    } else if (SELECT_MODE) {
        window.removeEventListener('keypress', dropDefectEnter);
    } else {
        window.removeEventListener('keypress', dropDefect);
    }
    ctx.fillStyle = endGame.color;
    ctx.strokeStyle = endGame.outline;
    ctx.lineWidth= endLineWidth;
    ctx.strokeRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
    ctx.fillRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
    finalLumens = calcLumens();
    console.log("final score: " + electronCount);
    requestAnimationFrame(endBox);
}

function endBox() {
    if (MOUSE_MODE){
        window.removeEventListener('click', listenDropDefectMouse);
    } else if (SELECT_MODE) {
        if (HOLD_NAVIGATE) {
            window.removeEventlistener('keydown', changeCellSelection);
            //window.removeEventListener('keypress', changeCellSelection);
        } else {
            window.removeEventListener('keypress', changeCellSelection);
        }
        window.removeEventListener('keypress', dropDefectEnter);
    } else {
        window.removeEventListener('keypress', dropDefect);
    }
    if (Math.floor(endCount/10)%2 == 0){
        ctx.strokeStyle = endGame.outline;
    } else {
        ctx.strokeStyle = endGame.outlineDark;
    }
    ctx.font = finalFont1;
    ctx.fillStyle = endGame.color;
    ctx.lineWidth = endLineWidth;
    ctx.strokeRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
    ctx.fillRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
    ctx.fillStyle = endGame.outline;
    ctx.strokeStyle = endGame.outline;
    if (!(endCount%10 === 0)){
        ctx.fillText('GAME OVER', 
                     endGame.posX + 0.25*endGame.width,
                     endGame.posY + 0.25*endGame.height);
    }
    if (endCount < endTime/4) {
        dots = '*';
    } else if (endCount < endTime/2) {
        dots = '*    *';
    } else if(endCount < 3*endTime/4){
        dots = '*    *    *';
    } else {
        dots = '*    *    *    *';
    }
    ctx.fillText(dots, 
                 endGame.posX + 0.3*endGame.width,
                 endGame.posY + 0.75*endGame.height, 
                 endGame.width);
    if (endCount++ < endTime) {
        requestAnimationFrame(endBox)
    } else {
        window.addEventListener('keydown', goBack);

        requestAnimationFrame(scoreSequence);
    }
}


function scoreSequence() {
    if (Math.floor(endCount2/10) % 2 == 0){
        ctx.strokeStyle = endGame.outline;
    } else {
        ctx.strokeStyle = endGame.outlineDark;
    }
    ctx.fillStyle = endGame.color;
    ctx.lineWidth = endLineWidth;
    ctx.strokeRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
    ctx.fillRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
    if (Math.floor(endCount2++/10) % 2 == 0){
        ctx.fillStyle = endGame.outline;
    } else {
        ctx.fillStyle = endGame.outlineDark;
    }
    ctx.font = finalFont2;
    ctx.fillText("Press Enter to RETURN.", 
                 endGame.posX + 0.1*endGame.width, 
                 endGame.posY + 0.9*endGame.height);

    var oneCount = 0;
    for (var p = 0; p < keyRows*keyDblColumns; p++) { 
        oneCount += (defected[p]) ? 1: 0 ;
    }
    var niceText, grade;

    ctx.fillStyle = endGame.outline;
    ctx.fillText("_____STATS_____", 
                 endGame.posX + 0.1*endGame.width,
                 endGame.posY + 0.18*endGame.height);
    ctx.fillText("TOTAL ELECTRONS:   " + electronCount, 
                 endGame.posX + 0.1*endGame.width, 
                 endGame.posY + 0.54*endGame.height);
    requestAnimationFrame(scoreSequence);
}

function goBack(evt){
    if (evt.keyCode == 13) {
        window.location.replace("index.html");
    }
}
