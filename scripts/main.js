var canvas, ctx, rect, dropSound, negateSound, bonusSound, bonusDropSound;
var mainShiftX=-120, mainShiftY=160;
var keyRows=13, keyDblColumns=7, shift=2.5;

var HEX_RADIUS=58, HEX_LINE_WIDTH=10, DEFECT_RADIUS=33;
var TIMED = true;
var PENALTY = true;
var MOUSE_MODE = false;
var SELECT_MODE = true;
var TUTORIAL = true;
var COUNT_ELECTRONS = true;
var DEFECT_LOSS = true;
var RESISTOR_MODE2 = true;
var PBC = true;
var NO_SELECT_FLASH = true;
var HOLD_NAVIGATE = false;
var cursorColour = "#00ff38";
var EXTRA_TUTORIAL = true;

// Difficulty settings
//
// TIME_LIMIT - Given in milliseconds, duration of a single game
// RES_ON - Resistance with defect on
// RES_OFF - Resistance with defect off
// MAX_LOSS_RATE - minimum duration between defects dropping off
// LOSS_POWER - exponent to determine how the drop off rate scales inversely with number of defects on system
// MAX_OUTPUT_LIMIT - Maximum time between electrons successively being released into the source
// LIMIT_POWER - Power which (1-lumens/MAX_LUMENS) is raised to, to get the change in electron rate with flow.
var TIME_LIMIT=59500;
var RES_ON=0.4;
var RES_OFF=5;
var MAX_LOSS_RATE=575;
var LOSS_POWER=5;
var MAX_OUTPUT_LIMIT=200;
var LIMIT_POWER=5.5;

// Updatable variables that describe the state of the overall game
//
// MAX_LUMENS - calculated at the start, used to get a measure of brightness for the bulbdd
// timeCounter - Time state of the user instance and interface between framerate with DateTime
// gameOver - Determines when to activate the end sequence
// startTime - Used to initiate the game
// currentTime - Used to keep track of the time
// defectCount - tracks # defects on 2D sheet
// currentPos - Site which has highlighted selection in SELECT_MODE
// chosenOne - Site of the defect which has been chosen to drop off
// lossCounter - used for counting the time until the next defect vanishes
// finalLumens - lumens score at the end of the game
// endCount, endCount2, endTime - Used for the endsequence to time the flashed with framerate
// dots - the printed asterisks at the end, takes the form of one, two , three or four asterisks.
// endLineWidth - Linewidth of the boxes at the end.
// previousLumens - record of last measured score of brightness to determine if the lightbulb needs changing
// lumensNow - current state of the lumens (brightness/flow/etc)
// counter - Frame counter for visual effects such as electron propagation and defect pulsation
// gateCounter - Counter for the appearence of electrons at wire2a
// outputLimit - Outputlimit of electrons at wire1 and wire3a
// gateCountLimit - Outputlimit of electrons at wire2a
var MAX_LUMENS=2000, timeCounter=0, gameOver=false, startTime, currentTime;
var defectCount=0, currentPos=39, chosenOne, lossCounter=0, lossWarningLimit=300, lossFlashPeriod=50;
var finalLumens, endCount=0, endCount2=0, endTime=200, dots, endLineWidth=27;
var previousLumens=0, lumensNow=1;
var electronCount=0, counter=0, gateCounter=0, outputLimit=60, gateCountLimit=15;

// Data structures - key bindings, canvas positions, defect boolean: for each site
// balls - Data Structures for the electrons in each wire
// keyCodelist - List of indices for sites
// buttonX, buttonY - positions of sites in x and y direction
// defected - number code for current state (0=no defect, 1=defect, 2=bonus atom)
// keyDict - links defect sites to keycodes for a keyboard input controller
var balls = [];
var keyCodeList=[], buttonX=[], buttonY=[], defected=[];
var keyDict = {49: 0, 113: 1, 97: 2, 33: 3, 81: 4, 65: 5, 50: 6, 119: 7, 115: 8, 64: 9, 87: 10, 51: 11, 101:
			   12, 100: 13, 163: 14,  69: 15,  68: 16,  52: 17,  114: 18,  102: 19, 36: 20, 82: 21,  53: 22,
			   116: 23,  103: 24,  37: 25,  84: 26,  71: 27,  54: 28,  121: 29,  104: 30,  94: 31,  89: 32,
			   55: 33,  117: 34,  106: 35,  38: 36, 85: 37,  74: 38,  56: 39,  105: 40,  107: 41,  42: 42,
			   73: 43,  57: 44,  111: 45,  108: 46,  40: 47,  79: 48,  76: 49,  48: 50,  112: 51,  59: 52,
			   41: 53, 80: 54,  45: 55,  91: 56,  39: 57,  173: 58,  123: 59,  34: 60, 61: 61,  93: 62,
			   92: 63,  43: 64,  125: 65 };
//_______________________________________________________________________________________________________________

// ________________________Other Visual Effect Variables_________________________________________________________
// ELECTRON_RADIUS - Speaks for itself
// ELECTRON_SPEED - Speaks for itself
// BUFFER - Pixel distance between electon and borders to prevent their edges leaving the wire.
// defect pulsation variables...
// MAX_DEFECT_FLUCT - Maximum deviation of defect pulsation
// FLUCT_INCRE - Fluctuation increment for the defect pulsation
// fluctSign-	current direction of the pulsation
// gradChange - radial gradient change for the defect pulsation
// ARE_THERE_NO_DEFECTS - Bool to decide if there are no defects on so we can globally set the light bulb of
// start2b - Boolean used to determine when to start electron flow in second arm of compound wire (wire2b)
// start3a - Boolean used to determine when to start electron flow in second arm of compound wire (wire3a)
// start3b - Boolean used to determine when to start electron flow in second arm of compound wire (wire3b)
var ELECTRON_RADIUS=18, ELECTRON_SPEED=10, BUFFER=3, MAX_DEFECT_FLUCT=0.4, FLUCT_INCRE=0.02;
var fluctSign=1, gradChange=0;
var ARE_THERE_NO_DEFECTS=true;
var start2b=false, start3a=false, start3b=false;
var addition, grd, grdGold, grdTwo;

//_______________________________________________________________________________________________________________

// ________________________Component graphical objects___________________________________________________________

// Visual parameters for the electrodes: gate, source and drain
var gate = {height:60, width:560, posX:750+mainShiftX, posY:670+mainShiftY};
var source = {height:510, width:60, posX:423+mainShiftX, posY:130+mainShiftY};
var drain = {height:510, width:60, posX:1660+mainShiftX, posY:130+mainShiftY};
var electrodes = [gate, source, drain];

// Visual parameters for the electron carrying wires
// wire1 - Connected to source electrode
// wire2a - Horizontal component of the wire connected to the gate
// wire2b - Vertical component of the wire connected to the gate
// wire3a - Wire connected to the drain, passing through lightbulb
var wire1 = {height:120, width:305, posX:-5, posY:350+mainShiftY, horizon:true, midstart:false};
var wire2a = {height:120, width:900, posX:-5, posY:890+mainShiftY, horizon: true, midstart:false};
var wire2b = {height:150, width:120, posX: wire2a.posX + wire2a.width-60, posY:gate.posY+gate.height+5,
			  horizon:false, midstart:false};
var wire3a = {height:120, width:1000, posX:drain.posX+drain.width*1.05, posY:drain.posY+0.5*drain.height,
			  horizon: true, midstart:true};
var wires = [wire1, wire2a, wire2b, wire3a];

// Visual parameters for other important graphics in the setup
// box1 - Covers joining of the two wires that connect to the gate
// bulb & bulbBox - makes up the bulb and its filament
// lbar - Visual representation of the number of electrons passed through bulb
// heat- Flow bar that shows the rate of electrons flowing through the system
var box1 = {posX:940+mainShiftX, posY:880+mainShiftY, width:150, height:150, circRad:10, circDist:20,
			innerSquareDist:25, color:'#676767', innerColor:'lightGray'};
var bulb = {posX: drain.posX + 350, posY: drain.posY+20, coreRadius:120, lightRadius:200, filRadius:10};
var bulbBox = {width:160, height: 160, shift: 40};
var lBar = {posX:1590, posY:810, width:510, height:150, innerSquareDist:20, outerColor:'#676767',
			innerColor:'black', textColor:'#03ff14'};
var heatBar = {posX: 150+mainShiftX, posY:-150+mainShiftY, width:600, height:150, innerSquareDist:20,
			   outerColor:'#676767',textColor:'#03ff14'};
var timer = {posX:heatBar.posX+heatBar.width, posY:heatBar.posY, width:250, height:lBar.height,
			innerSquareDist:20, outerColor:'#676767', innerColor:'black', dialColor:'#03ff14',
			dialY:heatBar.posY+100, dialX:heatBar.posX+1.25*lBar.width, dialRad:0.35*heatBar.height};
var endGame = {posX:400, posY:180, width:1200, height:800, color:'black', outline:'#03ff14',
			   outlineDark:'#006400'};
var finalFont1 = "140px Impact";
var finalFont2 = "110px Impact";
//_______________________________________________________________________________________________________________
// ____________BONUS atom variables_____________________________________________________________________________
// BONUS_MODE - turns on Bonus atom
// BONUS_FRAC - Determines the amount of extra electrons PER BONUS ATOM coming from the input.
// BONUS_THRESH - The user must keep the flow above this level for a certain time
// BONUS_DURATION - Time for which the user must keep the flow above BONUS_THRESH
// BONUS_BAR_WIDTH - Width of vertical line in flow bar when bonus state is achieved
// is_bonus - Defines the state of the user being able to place a bonus atom
// bonusCount - Counts the bonus atoms to determine the accelerated rate.
// bonusInit  - Defines the state of the counter of BONUS_DURATION being started of being over the threshold
// bonusTime 	- Used to keep track of the time within BONUS_DURATION to determine when a bonus atom is achieved.
// bonusStartTime - Variable for the time in which the the BONUS_DURATION clock is started, resets if
//				    user FLOW goes below the threshold.
var BONUS_MODE=true, BONUS_FRAC=0.1, BONUS_THRESH=0.45, BONUS_DURATION=15000, BONUS_BAR_WIDTH=20, BONUS_FLASH_PERIOD=30;
var is_bonus=false, bonusCount=0, bonusInit=true, bonusTime=0, bonusStartTime=0, bonusDefectPlaced=false, soundNotPlayed=true;

//_______________________________________________________________________________________________________________
// VISUAL
//_______________________________________________________________________________________________________________


// MK_INITS - All variables are defined up to here
window.onload = init;
function init() {
	// inits the canvas and the 2D context needed for the graphical animation
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext('2d');
    rect = canvas.getBoundingClientRect();
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	console.log("window width: "+ window.innerWidth+", window height: "+window.innerHeight);
// Initiates the sound effects througout the game (the id tags are all in the html document)
	dropSound = document.querySelector('#ping');
	negateSound = document.querySelector('#uhuh');
	bonusSound = document.querySelector('#bring');
	bonusDropSound = document.querySelector('#thud');
// Draw interFace - Electrodes
//	electrodes.forEach( function(electrode) { drawElectrode(electrode);});
	// Draw interface - Graphene lattice on top of the electrodes
//	hexGrid(mainShiftX, mainShiftY);
	// Initiate key binding listener and keylist
	for (var l = 0; l < keyRows*keyDblColumns; l++) {
		defected.push(0);
	}
	console.log("Pushed KeyCodes");
	MIN_LUMENS = calcLumens();
	MAX_LUMENS = determineMaxLumens();
	// Assign each hexagon with a point to be referenced when placing defects
    for( var i=shift; i < keyDblColumns+shift; i++) {
        for( var j=0; j<keyRows; j++) {
            buttonX.push((3*i+1+1.5*(j%2))*HEX_RADIUS+rect.left+mainShiftX);
			buttonY.push(j*(Math.sqrt(0.75)*HEX_RADIUS)+HEX_RADIUS+mainShiftY);
        }
    }
	console.log("Defect List Length: " + defected.length+ "Position List Length: "+buttonX.length);
	console.log("Assigned keys to positions of defects");
	audioPlayer = document.querySelector('#audioPlayer');
	// Initialise animation of electrons
	if (TUTORIAL) {
		// TUTORIAL mode should always be set to true, but if not this will just run the game
		requestAnimationFrame(tutorial);
	} else {
		// Draw interFace - Electrodes
		electrodes.forEach( function(electrode) { drawElectrode(electrode);});
		// Draw interface - Graphene lattice on top of the electrodes
		hexGrid(mainShiftX, mainShiftY);
		if (MOUSE_MODE){
			window.addEventListener('click', dropDefectMouse);
		} else if (SELECT_MODE) {
			if (HOLD_NAVIGATE) {
				window.addEventListener('keydown', changeSelection);
				//window.addEventListener('keypress', changeSelection);
			} else {
				window.addEventListener('keypress', changeSelection);
			}
			window.addEventListener('keypress', dropDefectEnter);
		}else {
			window.addEventListener('keypress', dropDefect);
		}
		console.log("Added listener to canvas");
		startTime = new Date().getTime();
		requestAnimationFrame(animate);
		audioPlayer.play();
		audioPlayer.addEventListener('ended', function () { this.currentTime=0; this.play(); }, false);
	}
}

// MK_BG

function drawElectrode(electrode) {
	grdGold = ctx.createLinearGradient(electrode.posX, electrode.posY, electrode.posX+electrode.width, electrode.posY);
	grdGold.addColorStop("0", 'yellow');
	grdGold.addColorStop("1", '#999a03');
	ctx.strokeStyle = "black";
	ctx.lineWidth = 8;
	ctx.fillStyle = grdGold;
	ctx.strokeRect(electrode.posX, electrode.posY, electrode.width, electrode.height);
	ctx.fillRect(electrode.posX, electrode.posY, electrode.width, electrode.height);
}

function hexGrid(shiftX=0.0, shiftY=0.0){
	// Draws lattice of graphene cells.
	rect = canvas.getBoundingClientRect();
	//console.log("rect.left = "+rect.left);
    var width=keyDblColumns, height=keyRows;
    for( var i=shift; i < width+shift; i++) {
        for( var j=0; j<height; j++) {
            drawHexagon(ctx, shiftX + (3*i+1+1.5*(j%2))*HEX_RADIUS+rect.left, shiftY + j*(Math.sqrt(0.75)*HEX_RADIUS)+HEX_RADIUS, HEX_RADIUS, "gray");
        }
    }
}

function drawHexagon (ctxt, x, y) {
    var fill = true;
    ctxt.fillStyle = "lightGray";
    ctxt.strokeStyle = "black";
    ctxt.lineWidth=HEX_LINE_WIDTH;
	ctxt.beginPath();
    ctxt.moveTo(x+HEX_RADIUS, y);
    ctxt.lineTo(x+(HEX_RADIUS*0.5), y + (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x-(0.5*HEX_RADIUS), y+ (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x-(HEX_RADIUS), y);
    ctxt.lineTo(x-(0.5*HEX_RADIUS), y-(Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x+(HEX_RADIUS*0.5), y-(Math.sqrt(0.75)*HEX_RADIUS));
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
    ctxt.lineWidth=8;
	ctxt.beginPath();
    ctxt.moveTo(x+HEX_RADIUS, y);
    ctxt.lineTo(x+(HEX_RADIUS*0.5), y + (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x-(0.5*HEX_RADIUS), y+ (Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x-(HEX_RADIUS), y);
    ctxt.lineTo(x-(0.5*HEX_RADIUS), y-(Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.lineTo(x+(HEX_RADIUS*0.5), y-(Math.sqrt(0.75)*HEX_RADIUS));
    ctxt.closePath();
    ctxt.stroke();
}

// MK_LISTEN
// Listener functions for the dropping of defects via either mouse or button bashing

function dropDefectMouse(evt) {
	var pos = getMousePos(evt);
	console.log('clicked at : '+pos.x+', '+pos.y);
	var dist = 10000;
	var key = 0;
	var magDiff;
	for (var i=0; i<defected.length; i++) {
		magDiff = Math.sqrt(Math.pow(pos.x - buttonX[i], 2)+ Math.pow(pos.y-buttonY[i], 2));
		if (magDiff < dist) {
			dist = magDiff;
			key = i;
		}
	}
	if (dist <= HEX_RADIUS) {
		// Two casas, there is no defect (0) or there is (1)
		if (defected[key] === 0) {
			// Fill with a radial gradient to blend with eh background
			grd=ctx.createRadialGradient(buttonX[key], buttonY[key],0.5*DEFECT_RADIUS,buttonX[key],buttonY[key],DEFECT_RADIUS);
			var colorNow = (is_bonus && BONUS_MODE)? "green": "red";
			var defectNumber = (is_bonus && BONUS_MODE)? 2 : 1;
			if (is_bonus && BONUS_MODE) {
				bonusCount += 1;
				is_bonus=false;
			}
			grd.addColorStop(0, colorNow);
			grd.addColorStop(1,"lightGray");
			ctx.fillStyle = grd;
			defected[key] = defectNumber;
			defectCount += 1;
			addition = 0;
			dropSound.play();
		} else if (defected[key] === 1) {
			// Return the pixels to the background gray;
			ctx.fillStyle = "lightGray";
			defected[key] = 0;
			addition = 1;
			defectCount -= 1;
			dropSound.play();
		} else if (defected[key] === 2) {
			negateSound.play();
		}
		ctx.beginPath();
		ctx.arc(buttonX[key], buttonY[key], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
	}
}

function getMousePos(evt) {
	rect = canvas.getBoundingClientRect();
	return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
}

function changeSelection(evt) {
	// Move the green cursor in the game
	var nMod=13, maxLines=7;
	var bb = currentPos;
	drawOutline(ctx, buttonX[currentPos], buttonY[currentPos], outline="black");
	var shifter = (Math.floor(bb/nMod)%2==0)? 0: 1;
	var longRow = ((bb+shifter)%2==0);
	switch(evt.charCode) {
		case 119:
		// UP
			if ((currentPos%nMod==0) || (currentPos%nMod==1)) {
				var temp = Math.floor(currentPos/nMod)*(nMod) + nMod - (currentPos%nMod + 1);
				currentPos = (PBC)? temp : currentPos;
			} else {
				currentPos = bb - 2;
			}
			break;
		case 115:
		// DOWN
			if ((currentPos%nMod==nMod-2)||(currentPos%nMod==nMod-1)){
				var temp = Math.floor(currentPos/nMod)*(nMod) + (currentPos%nMod == nMod -2);
				currentPos = (PBC)? temp : currentPos;
			} else {
				currentPos = bb + 2;
			}
			break;
		case 97:
		// LEFT
			if ((currentPos/nMod < 1) && (currentPos%2==0)){
				var correction = (currentPos == 0)? + 1 : -1;
				var temp =  (currentPos%nMod) + correction + (maxLines-1)*nMod;
				currentPos = (PBC)? temp : currentPos;
			} else {
				if (!(currentPos%nMod == 0)) {
					currentPos = (longRow)? bb - (nMod+1)  : bb + 1;
				} else {
					currentPos = bb - (nMod-1);
				}
			}
			break;
		case 100:
		// RIGHT
			if ((currentPos/nMod > maxLines-1) && (currentPos%2==1)) {
				var temp =  (currentPos%nMod) + 1;
				currentPos = (PBC)? temp : currentPos;
			} else {
				if (!(currentPos%nMod == 0)) {
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

// _____________________ELECTRON_AND_WIRE_ANIMATION__________________________
// MK_ANIMATE
function animate(){
	// Reset screen only for the wire
	wires.forEach( function(wire) { drawWire(wire)});
	// Only wnt a new electron to appear every so many seconds
	// First Three wires have a constant flow of electrons (very fast???)
	// POSSIBLE CHANGE: MAKE ALL ELECTRONS GO AT THE SAME SPEED.
	if (defectCount < 0) { defectCount = 0; }
	if ((counter++ > outputLimit)&&(defectCount>0)) {
		createBall(wire1);
		if(start3a) {createBall(wire3a);}
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
	if (lumensNow < MIN_LUMENS) {
		lumensNow = MIN_LUMENS;
	}

	outputLimit = MAX_OUTPUT_LIMIT*Math.pow((1 - (lumensNow/MAX_LUMENS)), LIMIT_POWER) - bonusCount*MAX_OUTPUT_LIMIT*BONUS_FRAC;
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
		var frac = (lumensNow-MIN_LUMENS)/(MAX_LUMENS-MIN_LUMENS);
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
			var bonusText = "BONUS: Keep flow above line for "+ timeLeft +"s !";
			var BONUS_BUFFER_X=300, BONUS_BUFFER_Y=80;
			var notify_x=heatBar.posX+heatBar.innerSquareDist + heatBar.width + BONUS_BUFFER_X;
			var notify_y=heatBar.posY+heatBar.innerSquareDist;
			var notify_width=1300, notify_height=90;

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
					var notification = "YOU WON A STRONGER BONUS ATOM!";
					if (soundNotPlayed) {
						bonusSound.play();
						soundNotPlayed=false;
					}
//					bonusSound.play();
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
		// Two casas, there is no defect (0) or there is (1)
			grd=ctx.createRadialGradient(buttonX[i], buttonY[i],gradFrac*DEFECT_RADIUS,buttonX[i],buttonY[i],DEFECT_RADIUS);
			grd.addColorStop(0,"red");
			grd.addColorStop(1,"lightGray");
			ctx.fillStyle = grd;
			ctx.beginPath();
			ctx.arc(buttonX[i], buttonY[i], DEFECT_RADIUS, 0, 2*Math.PI);
			ctx.fill();
		} else if (defected[i] === 2) {
			grd=ctx.createRadialGradient(buttonX[i], buttonY[i],gradFrac*DEFECT_RADIUS,buttonX[i],buttonY[i],DEFECT_RADIUS);
			grd.addColorStop(0,"green");
			grd.addColorStop(1,"lightGray");
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
		ctx.clearRect(wire.posX, wire.posY-ELECTRON_RADIUS, wire.width+BUFFER, wire.height + (2*ELECTRON_RADIUS));
//		uncomment below for the old type of wire gradient
//		grd = ctx.createLinearGradient(wire.posX, wire.posY, wire.posX+wire.width, wire.posY);
		grd = ctx.createLinearGradient(wire.posX, wire.posY, wire.posX, wire.posY+wire.height);
	} else {
		ctx.clearRect(wire.posX-ELECTRON_RADIUS, wire.posY-BUFFER, wire.width + (2*ELECTRON_RADIUS)+BUFFER, wire.height+BUFFER);
// 		uncomment below for the old type of gradient
//		grd = ctx.createLinearGradient(wire.posX, wire.posY, wire.posX, wire.posY+wire.height);
		grd = ctx.createLinearGradient(wire.posX, wire.posY, wire.posX+wire.width, wire.posY);
	}
	grd.addColorStop(0, "#474747");
	grd.addColorStop(0.5, "lightGray");
	grd.addColorStop(1, "#474747");
	ctx.fillStyle = grd;
	ctx.strokeStyle="black";
	ctx.lineWidth = 10;
	ctx.strokeRect(wire.posX, wire.posY, wire.width, wire.height);
	ctx.fillRect(wire.posX, wire.posY, wire.width, wire.height);
}


function drawBox(box) {
	ctx.clearRect(box.posX, box.posY, box.width, box.heigh);
	ctx.fillStyle = box.color;
	ctx.strokeStyle = "black";
	ctx.linewidth = 2;

	// Outer shape
	ctx.strokeRect(box.posX, box.posY, box.width, box.height);
	ctx.fillRect(box.posX, box.posY, box.width, box.height);

	// Internal Decoration
	ctx.fillStyle = box.innerColor
	for (var i2=0; i2 < 2; i2++ ){
		for (var j2=0; j2 < 2 ; j2++) {
		ctx.beginPath();
		ctx.arc(box.posX+box.circDist + i2*(box.width-2*box.circDist), box.posY+box.circDist+ j2*(box.height - 2*box.circDist), box.circRad, 0, 2*Math.PI);
		ctx.fill();
		}
	}
	ctx.fillRect(box.posX+box.innerSquareDist, box.posY+box.innerSquareDist, box.width-2*box.innerSquareDist, box.height-2*box.innerSquareDist);
}


// MK_BALLS

function createBall(wire) {
	// creates ball in 'wire' which has a wire.horizon variable to check the orientation of the wire.
  var ball = {r:ELECTRON_RADIUS,
         x: (wire.horizon)? wire.posX+4 : wire.posX + (wire.width*0.5)+(0.5*Math.random()*(wire.width-ELECTRON_RADIUS-2)),
         y: (wire.horizon)? wire.posY+(wire.height*0.5)+(0.5*Math.random()*(wire.height-ELECTRON_RADIUS-2)) : wire.posY+wire.height,
         speedX: (wire.horizon)? ELECTRON_SPEED : (Math.random()*0.5 - 0.25)*ELECTRON_SPEED ,
         speedY:(wire.horizon)? (Math.random()*0.5 - 0.25)*ELECTRON_SPEED: -ELECTRON_SPEED,
		 wirename: wire, uncounted:true};
  if (wire.midstart == true) { ball.x = ball.x + 3.5*BUFFER;}
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
  balls.forEach( function (b) {
                var gradient = ctx.createLinearGradient(b.x-b.r, b.y, b.x+b.r, b.y);
                gradient.addColorStop("0",'#23ecfd');
                gradient.addColorStop("1.0",'#007dc9');
                ctx.fillStyle=gradient;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, 2*Math.PI);
                ctx.fill();
                b.x += b.speedX;
                b.y += b.speedY;
                });
}


// MK_LUMEN

function drawBulb() {
	grd = ctx.createRadialGradient(bulb.posX, bulb.posY, 0, bulb.posX, bulb.posY, bulb.lightRadius);
	var luFrac = lumensNow/MAX_LUMENS;
	// Two gradient colours for the light bulb make it look realistic white and cream
	grd.addColorStop(((1-Math.pow(2.71828, -luFrac))/(1-Math.pow(2.71828, -1)))*0.9*0.6, 'white');
	grd.addColorStop(((1-Math.pow(2.71828, -luFrac))/(1-Math.pow(2.71828, -1)))*0.9, '#fff594');
	// light from bulb fades into the background
	grd.addColorStop(1, 'transparent');
	ctx.fillStyle=grd;
	ctx.lineWidth = 6;
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
	ctx.lineWidth=3;
	//var luFrac = lumensNow/MAX_LUMENS;
	var frac = Math.sqrt((lumensNow-MIN_LUMENS)/(MAX_LUMENS-MIN_LUMENS));
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
	ctx.lineWidth = 5;
	ctx.fillRect(lBar.posX, lBar.posY, lBar.width, lBar.height);
	ctx.strokeRect(lBar.posX, lBar.posY, lBar.width, lBar.height);
	// inner Box
	ctx.fillStyle = lBar.innerColor;
	ctx.fillRect(lBar.posX+lBar.innerSquareDist, lBar.posY+lBar.innerSquareDist, lBar.width-2*lBar.innerSquareDist, lBar.height-2*lBar.innerSquareDist);
	// live text
	ctx.fillStyle = lBar.textColor;
	ctx.font = "70px Impact";
	if (COUNT_ELECTRONS) {
		ctx.fillText("Electrons: " + electronCount, lBar.posX+2*lBar.innerSquareDist, lBar.posY+5*lBar.innerSquareDist);
	} else {
		ctx.fillText(lumensNow + " L", lBar.posX+2*lBar.innerSquareDist, lBar.posY+5*lBar.innerSquareDist);
	}
}

function calcLumens() {
    var sumOdd=0, sumEven=0;
    var resTot=0;
	var noneCheck=true;
    for (var l=0; l < keyDblColumns*keyRows; l++){
        if ((l%keyRows === 0) && (l !== 0)) {
			if (RESISTOR_MODE2) {
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

	if (RESISTOR_MODE2) {
		resTot += 1./(sumOdd + sumEven);
	} else {
		resTot += 1./sumOdd + 1./sumEven;
	}
	ARE_THERE_NO_DEFECTS = noneCheck;
	return Math.round(1000./resTot);

}

function determineMaxLumens() {
    var sumOdd=0, sumEven=0;
    var resTot=0;
    for (var l=0; l < keyDblColumns*keyRows; l++){
        if ((l%keyRows === 0) && (l !== 0)) {
			if (RESISTOR_MODE2) {
				resTot += 1./(sumOdd + sumEven);
			} else {
            	resTot += 1./sumOdd + 1./sumEven;
			}
            sumOdd = 0;
            sumEven = 0;
        }
		var reduceFactor = 1;
		var siteRes = ((l%keyRows)%3 == 0)? reduceFactor*RES_ON : RES_OFF ;
        if (l%2 === 0) {
            sumEven += 1./siteRes;
        } else {
            sumOdd += 1./siteRes;
        }
    }
	if (RESISTOR_MODE2) {
		resTot += 1./(sumOdd + sumEven);
	} else {
		resTot += 1./sumOdd + 1./sumEven;
	}
	return Math.round(1000./resTot);
}

function neighbourList(site) {
    var nList;
    // Decider variables of position.
    var colNum = Math.floor(site/keyRows);
    var siteEven = ((site-colNum*keyRows)%2 === 0);
    var parity = (siteEven)? -1.0 : 1.0;
    var toppy = ((site%keyRows === 0) || (site%keyRows == 1))? 1: 0;
    var downy = ((site%keyRows === keyRows - 1) || (site%keyRows === keyRows - 2))? 1 : 0;
    var lefty = ((site < keyRows) && (siteEven))? 1 : 0;
    var righty= ((site >= keyRows*(keyDblColumns-1)) && ((site-colNum*keyRows)%2 === 1))? 1 : 0;
    if (toppy) {
        // deals with top boundary and top corners too
        nList = [site+2];
        if (!righty) { nList.push( (siteEven)? site+1 : site+keyRows-1);
                       if (!siteEven) { nList.push(site+keyRows+1); } }
        if (!lefty) { nList.push( (siteEven)? site-keyRows+1: site-1);
                       if (!siteEven) { nList.push(site+1); } }
    } else if (downy) {
        // deals with bottom boundary and bottom corners too
        nList = [site-2];
        if (!righty) { nList.push( (siteEven)? site-1 : site+keyRows+1);
                       if (!siteEven) { nList.push(site+keyRows-1); } }
        if (!lefty) { nList.push( (siteEven)? site-keyRows+1: site+1);
                       if (!siteEven) { nList.push(site-1); } }
    } else if (lefty || righty) {
        // non-corner left side
        nList = [site-2, site+2, site+1, site-1];
    } else {
        // non-boundary sites
       nList = [site-1, site+1, site+2,
                    site-2, site+(parity*keyRows)+1,
                    site+(parity*keyRows)-1];
    }
    return nList;
}

// MK_HEATBAR

function drawHeatBar(){
	ctx.font = "90px Impact";
	ctx.fillStyle = heatBar.outerColor;
	ctx.strokeStyle = "black"
	ctx.lineWidth = "12px";
	ctx.fillRect(heatBar.posX, heatBar.posY, heatBar.width, heatBar.height);
	ctx.strokeRect(heatBar.posX, heatBar.posY, heatBar.width, heatBar.height);
	ctx.fillStyle = "black";
	ctx.fillRect(heatBar.posX+heatBar.innerSquareDist, heatBar.posY+heatBar.innerSquareDist, (heatBar.width-2*heatBar.innerSquareDist),
				heatBar.height-2*heatBar.innerSquareDist);
	var frac = (lumensNow-MIN_LUMENS)/(MAX_LUMENS-MIN_LUMENS);
	if ((BONUS_MODE) && (frac >= BONUS_THRESH)) {
		grd = ctx.createLinearGradient(heatBar.posX, heatBar.posY, heatBar.posX+heatBar.width, heatBar.posY);
		grd.addColorStop(0.0, "black");
		grd.addColorStop(0.4,"orange");
		grd.addColorStop(0.7, "red");
	} else {
		grd = ctx.createLinearGradient(heatBar.posX, heatBar.posY, heatBar.posX+heatBar.width, heatBar.posY);
		grd.addColorStop(0, "#6600cc");
		grd.addColorStop(0.1,"blue");
		grd.addColorStop(0.2, "green");
		grd.addColorStop(0.4, "yellow");
		grd.addColorStop(0.7, "orange");
		grd.addColorStop(1.0, "red");
	}
	ctx.fillStyle = grd;
	var frac = Math.sqrt((lumensNow-MIN_LUMENS)/(MAX_LUMENS-MIN_LUMENS));
	var visualThresh = Math.sqrt(BONUS_THRESH);
	if (frac > 1) {
		frac = 1;
	}
	ctx.fillRect(heatBar.posX+heatBar.innerSquareDist, heatBar.posY+heatBar.innerSquareDist, (heatBar.width-2*heatBar.innerSquareDist)*frac,
				heatBar.height-2*heatBar.innerSquareDist);
	// Trying to animate the bonus
	ctx.fillStyle = "white";
	ctx.fillText("FLOW", 12+heatBar.posX+heatBar.width*0.05, 12+heatBar.posY+heatBar.innerSquareDist+0.5*heatBar.height);
	ctx.strokeText("FLOW", 12+heatBar.posX+heatBar.width*0.05, 12+heatBar.posY+heatBar.innerSquareDist+0.5*heatBar.height);
}

// MK_LOSS

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
		ctx.arc(buttonX[site], buttonY[site], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
}

// MK_TIMER

function drawTimer() {
	ctx.fillStyle = timer.outerColor;
	ctx.strokeStyle = "black";
	ctx.lineWidth = 5;
	ctx.fillRect(timer.posX, timer.posY, timer.width, timer.height);
	ctx.strokeRect(timer.posX, timer.posY, timer.width, timer.height);
	// inner Box
	ctx.fillStyle = timer.innerColor;
	ctx.fillRect(timer.posX+timer.innerSquareDist, timer.posY+timer.innerSquareDist, timer.width-2*timer.innerSquareDist, timer.height-2*timer.innerSquareDist);
	// time dial
	ctx.fillStyle = timer.dialColor;
	var timeInBox = Math.floor((TIME_LIMIT-currentTime+startTime)/1000)
	if (timeInBox < 0) { timeInBox = 0; }
	if (timeInBox < 10) {
		ctx.fillText("00:0"+timeInBox, timer.dialX, timer.dialY);
	} else {
		ctx.fillText("00:"+timeInBox, timer.dialX, timer.dialY);
	}
}

//MK_ENDING

function storeScore(score){
  var username = sessionStorage.username;
  var usernames = JSON.parse(localStorage.usernames);
  // Search through list of dictionaries
  for(var i in usernames){
      if(usernames[i].name == username){
          // Add an element to the dictionary
          break; // If you want to break out of the loop once you've found a match
      }
  }
  usernames[i].score = score;
	usernames[i].bonusAtoms = bonusCount;
  localStorage.usernames = JSON.stringify(usernames);
}

function endSequence() {
	gameOver = true;
	if (MOUSE_MODE) {
		window.removeEventListener('click', dropDefectMouse);
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
  storeScore(electronCount);
	console.log("final score: " + electronCount);
	requestAnimationFrame(endBox);

}


function endBox() {

	if (MOUSE_MODE){
		window.removeEventListener('click', dropDefectMouse);
	} else if (SELECT_MODE) {
		if (HOLD_NAVIGATE) {
			window.removeEventlistener('keydown', changeSelection);
			//window.removeEventListener('keypress', changeSelection);
		} else {
			window.removeEventListener('keypress', changeSelection);
		}
		window.removeEventListener('keypress', dropDefectEnter);
	}else {
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
		ctx.fillText('GAME OVER', endGame.posX+0.25*endGame.width, endGame.posY+0.25*endGame.height);
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
	ctx.fillText(dots, endGame.posX+0.3*endGame.width, endGame.posY+0.75*endGame.height, endGame.width);
	if (endCount++ < endTime) {
		requestAnimationFrame(endBox)
	} else {
		window.addEventListener('keydown', goBack);

		requestAnimationFrame(scoreSequence);
	}
}

function findRank(finalLumens) {

    // Find current userName
		var name = sessionStorage.username;

    // no need to recall the function (it's an interval, it'll loop forever)
    users = JSON.parse(localStorage.usernames); // This is a list of dictionaries

    // Filter out users with undefined scores
    usersWithScore = [];
    for (var i = 0; i < users.length; i++) {
        if (!(typeof users[i].score in window )) {
            usersWithScore.push(users[i]);
        }
    }

    // Create leaders array
    var scores = Object.keys(usersWithScore).map(function(key) {
      return usersWithScore[key].score;
    });

    //console.log("scores");
		//console.log(scores);

    var sorted = scores.slice().sort(function(a,b){return b-a});
		sorted.push(electronCount);
		//sorted.push(finalLumens);
		numberOfPlayers = sorted.length;
    var ranks = scores.slice().map(function(v){ return sorted.indexOf(v)+1 });

    userRank = ranks[ranks.length-1];
		//console.log("userRank",userRank);
		//console.log("numberOfPlayers",numberOfPlayers);
		//console.log(userRank,"/",numberOfPlayers);

    var ranking = userRank+"/"+numberOfPlayers;

		return ranking;
}

function scoreSequence() {
	// Find User Ranking
	ranking = findRank();
  //console.log("ranking",ranking);
	if (Math.floor(endCount2/10)%2 == 0){
		ctx.strokeStyle = endGame.outline;
	} else {
		ctx.strokeStyle = endGame.outlineDark;
	}
	ctx.fillStyle = endGame.color;
	ctx.lineWidth = endLineWidth;
	ctx.strokeRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
	ctx.fillRect(endGame.posX, endGame.posY, endGame.width, endGame.height);
	if (Math.floor(endCount2++/10)%2 == 0){
		ctx.fillStyle = endGame.outline;
	} else {
		ctx.fillStyle = endGame.outlineDark;
	}
	ctx.font = finalFont2;
	ctx.fillText("Press A to RETURN.", endGame.posX+0.1*endGame.width, endGame.posY+0.9*endGame.height);

	var oneCount = 0;
	for (var p = 0; p < keyRows*keyDblColumns;p++) { oneCount += (defected[p])? 1: 0 ;}
	var niceText, grade;

	ctx.fillStyle = endGame.outline;
	ctx.fillText("_____STATS_____", endGame.posX+0.1*endGame.width, endGame.posY+0.18*endGame.height);
	ctx.fillText("ENGINEER:   "+ sessionStorage.username, endGame.posX+0.1*endGame.width, endGame.posY+0.36*endGame.height);
  	ctx.fillText("TOTAL ELECTRONS:   "+electronCount, endGame.posX+0.1*endGame.width, endGame.posY+0.54*endGame.height);
  	ctx.fillText("RANKING:   "+ranking, endGame.posX+0.1*endGame.width, endGame.posY+0.72*endGame.height);
//	ctx.fillText(niceText, endGame.posX+ctx.lineWidth, endGame.posY+0.5*endGame.height, endGame.width);
	requestAnimationFrame(scoreSequence);
}

function goBack(evt){
	if (evt.keyCode == 13) {
		window.location.replace("intro.html");
	}
}


//MK_TUTOR
// Manages the tutorial part of the game
var currentTut, requestID, i2=0, sound1, flashCount=8;
var tut = {width:400, height:400, color:'black', outline:'#03ff14', outlineDark:'#006400'};
var pos = {hexX:40, hexY:40, wireX:40, wireY:300, defX:400, defY:400, bulbX:550, bulbY:40};
var tutCount=0, nameBool=true, hexBool=true, wireBool=true, defectBool=true, speedUpBool=true, crowdedBool=true, bulbBool=true;
// objects for tutorial
var boxName = {posX: tut.width*1.5, posY: tut.height*0.8, width:tut.width*3, height:tut.height*1.5, myBool: true,
  			 soundId: '#welcome', boxText1:"Welcome, "+sessionStorage.username+"!",boxText2:" ", boxFont:"80px Impact",
			 textX1: 150, textX2:300, mainfunc:fillerFunc, textSep:0.3, pressAGapX:0.2, pressAGapY:0.7};
var boxHex = {posX: 40 , posY: 40, width: tut.width*5, height:tut.height-150, myBool: true ,
			 soundId: '#v4', boxText1:'This is an electronic switch called a TRANSISTOR,', boxText2:'made from layers of GRAPHENE.', boxFont:"70px Impact" ,
			 textX1: 60, textX2:60, mainfunc:fillerFunc, textSep:0.6, pressAGapX:0.6, pressAGapY:0.8} ;
var boxWire = {posX: tut.width*2 , posY: 40, width: tut.width*3.2, height:tut.height-100, myBool: true ,
			 soundId: '#v5', boxText1:'Add DEFECT atoms to its surface to', boxText2:'increase electron FLOW to the LIGHT BULB!', boxFont:"70px Impact" ,
			 textX1: 40, textX2:40, mainfunc: dropAndFlow, textSep:0.6, pressAGapX:0.4, pressAGapY:0.9};
var boxDefect = {posX: 40 , posY: 40, width: tut.width*5, height:tut.height-150, myBool: true ,
			 soundId: '#v6', boxText1:'Be warned, placing DEFECTS next to each other', boxText2:'will BLOCK and REDUCE the FLOW!', boxFont:"70px Impact" ,
			 textX1: 50, textX2:50, mainfunc: defectCrowd, textSep:0.6, pressAGapX:0.7, pressAGapY:0.8};
var boxGoodbye = {posX: 400, posY: 550, width:tut.width*3, height:tut.height ,myBool: true ,
			 soundId: '#v8', boxText1:'You have ONE MINUTE '+sessionStorage.username+', ', boxText2:" Good luck!", boxFont:"80px Impact" ,
			 textX1: 30, textX2:30, mainfunc:goodLuck, textSep:0.6, pressAGapX:0.4, pressAGapY:0.8};
var boxHeat = {posX: tut.width*2 , posY: 20, width: tut.width*3.2, height:tut.height-100, myBool: true ,
			 soundId: '#v7', boxText1:'HEAT from the electron FLOW will cause', boxText2:'the DEFECTSs to drop off over time!', boxFont:"70px Impact",
			 textX1: 50, textX2:50, mainfunc:dropOff, textSep:0.6, pressAGapX:0.5, pressAGapY:0.9};
// Organise into array to loop
var tutArray = [boxName, boxHex, boxWire, boxDefect, boxHeat, boxGoodbye];


function aFreshStart() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = "12px"
	electrodes.forEach( function(electrode) { drawElectrode(electrode);});
	hexGrid(mainShiftX, mainShiftY);
	// Reset screen only for the wire
	wires.forEach( function(wire) { drawWire(wire)});
	// Only wnt a new electron to appear every so many seconds
	drawBox(box1);
	drawBulbBox();
	lumensNow = calcLumens();
	drawBulb();
	drawScoreBar();
	drawHeatBar();
	previousLumens = lumensNow;
}

function preTutorial1 (evt) {
	if (evt.keyCode == 13 ){
		preTut = false;
		window.removeEventListener('keypress', preTutorial1);
		requestAnimationFrame(tutorial);
	}
}


function tutorial() {
	ctx.lineWidth = "12px";
	aFreshStart();
	currentTut = tutArray[i2++];
	ctx.font = currentTut.boxFont;
	if (MOUSE_MODE) {
		window.addEventListener('click', tutGenInit);
	} else {
		window.addEventListener('keypress', tutGenInit);
	}
	sound1 = document.querySelector(currentTut.soundId);
	sound1.play();
	requestID = requestAnimationFrame(tutGenMain);
}

function initialPictures() {
	var im1 = new Image(), im2 = new Image(), im3 = new Image();
	im1.src = "images/mos2.jpg";
	im2.src = "images/slg.png";
	im3.src = "images/blg.png";

}


function tutGenInit() {
	tutCount=0;
	currentTut.myBool = false;
	sound1.pause();
	if (i2 == tutArray.length) {
		aFreshStart();
		if (MOUSE_MODE) {
			window.removeEventListener('click', tutGenInit);
		} else {
			window.removeEventListener('keypress', tutGenInit);
		}
		cancelAnimationFrame(requestID);
		audioPlayer.play();
		audioPlayer.addEventListener('ended', function () { this.currentTime=0; this.play(); }, false);
		if (MOUSE_MODE){
			window.addEventListener('click', dropDefectMouse);
		} else if (SELECT_MODE) {
			if (HOLD_NAVIGATE) {
				window.addEventListener('keydown', changeSelection);
			//	window.addEventListener('keypress', changeSelection);
			} else {
				window.addEventListener('keypress', changeSelection);
			}
			window.addEventListener('keypress', dropDefectEnter);
		}else {
			window.addEventListener('keypress', dropDefect);
		}
		console.log("Added listener to canvas");
		startTime = new Date().getTime();
		requestAnimationFrame(animate);
	}
	currentTut = tutArray[i2++];
	aFreshStart();
	if (i2 <= tutArray.length){
		console.log(i2);
		ctx.font = currentTut.boxFont;
		sound1 = document.querySelector(currentTut.soundId);
		sound1.play();
	}
}


function tutGenMain(){
//	ctx.lineWidth = "12px";
	aFreshStart();
	currentTut.mainfunc();
	ctx.lineWidth = "30px";
	ctx.font = currentTut.boxFont;
	if (Math.floor(tutCount/flashCount)%2 == 0){
		ctx.strokeStyle = tut.outline;
	} else {
		ctx.strokeStyle = tut.outlineDark;
	}
	ctx.fillStyle = tut.color;
	ctx.lineWidth = endLineWidth;
	ctx.strokeRect(currentTut.posX, currentTut.posY, currentTut.width, currentTut.height);
	ctx.fillRect(currentTut.posX, currentTut.posY, currentTut.width, currentTut.height);
	if (Math.floor(tutCount/flashCount)%2 == 0){
		ctx.fillStyle = tut.outline;
	} else {
		ctx.fillStyle = tut.outlineDark;
	}
	tutCount++;
	ctx.fillText("Press A to continue.", currentTut.posX+currentTut.pressAGapX*currentTut.width, currentTut.posY+currentTut.pressAGapY*currentTut.height);
	ctx.fillStyle = tut.outline;
	ctx.fillText(currentTut.boxText1, currentTut.posX+currentTut.textX1, currentTut.posY+0.25*currentTut.height);
	ctx.fillText(currentTut.boxText2, currentTut.posX+currentTut.textX2, currentTut.posY+currentTut.textSep*currentTut.height, currentTut.width);
	requestAnimationFrame(tutGenMain);
}


function fillerFunc() {
}

function imageOk(img) {
	if (!img.complete) {
		return false;
	}
	return true;

}

function showImages1() {
//	var im1 = new Image();
//	im1.src = 'images/mos2.jpg';
//
//	if (im1.complete) {ctx.drawImage(im1, 0, 0);}
}

var tutCountTest=0, testOutput=50, gateCounterTut=0, start3aTut=false, start2bTut=false;
function dropAndFlow(){
	if (tutCountTest++ > testOutput) {
		createBall(wire1);
		if(start3a) {createBall(wire3a);}
		tutCountTest = 0;
	}
	if (gateCounterTut++ > gateCountLimit) {
		createBall(wire2a);
		if(start2b) {createBall(wire2b);}
		gateCounterTut = 0;
	}
	moveBalls();
	checkCollision();
	drawBox(box1);
	drawBulbBox();
	var testBut = 24;
	if ( gradChange < -MAX_DEFECT_FLUCT) {
		fluctSign = 1;
	} else if (gradChange > MAX_DEFECT_FLUCT) {
	  	fluctSign = -1;
	}
	gradChange += fluctSign*FLUCT_INCRE;
	var gradFrac = 0.5 + gradChange;
	if ( gradChange < -MAX_DEFECT_FLUCT) {
		fluctSign = 1;
	} else if (gradChange > MAX_DEFECT_FLUCT) {
	  	fluctSign = -1;
	}
	gradChange += fluctSign*FLUCT_INCRE;
	var gradFrac = 0.5 + gradChange;
	grd=ctx.createRadialGradient(buttonX[testBut], buttonY[testBut],gradFrac*DEFECT_RADIUS,buttonX[testBut],buttonY[testBut],DEFECT_RADIUS);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"lightGray");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(buttonX[testBut], buttonY[testBut], DEFECT_RADIUS, 0, 2*Math.PI);
	ctx.fill();
}

function defectCrowd() {
	if (tutCountTest++ > testOutput) {
		createBall(wire1);
		if(start3a) {createBall(wire3a);}
		tutCountTest = 0;
	}
	if (gateCounterTut++ > gateCountLimit) {
		createBall(wire2a);
		if(start2b) {createBall(wire2b);}
		gateCounterTut = 0;
	}
	moveBalls();
	checkCollision();
	drawBox(box1);
	drawBulbBox();
	var testBut = 24;
	if ( gradChange < -MAX_DEFECT_FLUCT) {
		fluctSign = 1;
	} else if (gradChange > MAX_DEFECT_FLUCT) {
	  	fluctSign = -1;
	}
	gradChange += fluctSign*FLUCT_INCRE;
	var gradFrac = 0.5 + gradChange;
	if ( gradChange < -MAX_DEFECT_FLUCT) {
		fluctSign = 1;
	} else if (gradChange > MAX_DEFECT_FLUCT) {
	  	fluctSign = -1;
	}
	gradChange += fluctSign*FLUCT_INCRE;
	var gradFrac = 0.5 + gradChange;
	grd=ctx.createRadialGradient(buttonX[testBut], buttonY[testBut],gradFrac*DEFECT_RADIUS,buttonX[testBut],buttonY[testBut],DEFECT_RADIUS);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"lightGray");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(buttonX[testBut], buttonY[testBut], DEFECT_RADIUS, 0, 2*Math.PI);
	ctx.fill();
	grd=ctx.createRadialGradient(buttonX[testBut+1], buttonY[testBut+1],gradFrac*DEFECT_RADIUS,buttonX[testBut+1],buttonY[testBut+1],DEFECT_RADIUS);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"lightGray");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(buttonX[testBut+1], buttonY[testBut+1], DEFECT_RADIUS, 0, 2*Math.PI);
	ctx.fill();
	grd=ctx.createRadialGradient(buttonX[testBut+2], buttonY[testBut+2],gradFrac*DEFECT_RADIUS,buttonX[testBut+2],buttonY[testBut+2],DEFECT_RADIUS);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"lightGray");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(buttonX[testBut+2], buttonY[testBut+2], DEFECT_RADIUS, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = "red"
	ctx.beginPath();
	var crossX=900, crossY=500, cln=30;
	ctx.moveTo(crossX, crossY);
	ctx.lineTo(crossX+2*cln, crossY+2*cln);
	ctx.lineTo(crossX+2*cln+cln, crossY+2*cln-cln);
	ctx.lineTo(crossX+2*cln+cln-2*cln, crossY+2*cln-cln-2*cln);
	ctx.lineTo(crossX+cln+2*cln, crossY-cln-2*cln);
	ctx.lineTo(crossX+cln+2*cln-cln, crossY-cln-2*cln-cln);
	ctx.lineTo(crossX+cln+2*cln-cln-2*cln, crossY-cln-2*cln-cln+2*cln);
	ctx.lineTo(crossX-2*cln, crossY-2*cln-2*cln);
	ctx.lineTo(crossX-2*cln-cln, crossY-2*cln-2*cln+cln);
	ctx.lineTo(crossX-2*cln-cln+2*cln, crossY-2*cln-2*cln+cln+2*cln);
	ctx.lineTo(crossX-cln-2*cln, crossY-cln+2*cln);
	ctx.lineTo(crossX-cln-2*cln+cln, crossY-cln+2*cln+cln);
	ctx.lineTo(crossX-cln-2*cln+cln+2*cln, crossY-cln+2*cln+cln-2*cln);
	ctx.closePath();
	ctx.fill();
}

//function showMaterials () {
//	var img = new Image():
//	ctx.drawImage(img, );
//
//}

// Part of the Tutorial which shows defects dropping off the system
var tutDropCount=0, tutDropLimit=60;
var but1=20, but2=31, but3=42;
function dropOff() {
	// drop three defects
	if (tutCountTest++ > testOutput) {
		createBall(wire1);
		if(start3a) {createBall(wire3a);}
		tutCountTest = 0;
	}
	if (gateCounterTut++ > gateCountLimit) {
		createBall(wire2a);
		if(start2b) {createBall(wire2b);}
		gateCounterTut = 0;
	}
	moveBalls();
	checkCollision();
	drawBox(box1);
	drawBulbBox();
	if ( gradChange < -MAX_DEFECT_FLUCT) {
		fluctSign = 1;
	} else if (gradChange > MAX_DEFECT_FLUCT) {
	  	fluctSign = -1;
	}
	gradChange += fluctSign*FLUCT_INCRE;
	var gradFrac = 0.5 + gradChange;
	if ( gradChange < -MAX_DEFECT_FLUCT) {
		fluctSign = 1;
	} else if (gradChange > MAX_DEFECT_FLUCT) {
	  	fluctSign = -1;
	}
	gradChange += fluctSign*FLUCT_INCRE;
	var gradFrac = 0.5 + gradChange;
	grd=ctx.createRadialGradient(buttonX[but1], buttonY[but1],gradFrac*DEFECT_RADIUS,buttonX[but1],buttonY[but1],DEFECT_RADIUS);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"lightGray");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(buttonX[but1], buttonY[but1], DEFECT_RADIUS, 0, 2*Math.PI);
	ctx.fill();
	grd=ctx.createRadialGradient(buttonX[but2], buttonY[but2],gradFrac*DEFECT_RADIUS,buttonX[but2],buttonY[but2],DEFECT_RADIUS);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"lightGray");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(buttonX[but2], buttonY[but2], DEFECT_RADIUS, 0, 2*Math.PI);
	ctx.fill();
	grd=ctx.createRadialGradient(buttonX[but3], buttonY[but3],gradFrac*DEFECT_RADIUS,buttonX[but3],buttonY[but3],DEFECT_RADIUS);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"lightGray");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(buttonX[but3], buttonY[but3], DEFECT_RADIUS, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = "red"
	ctx.beginPath();
	addition=1
	ctx.fillStyle= "lightGray";
	if (tutDropCount < tutDropLimit) {
		//show all three
	} else if ( tutDropCount < tutDropLimit*2) {
		ctx.beginPath();
		ctx.arc(buttonX[but3], buttonY[but3], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
	} else if (tutDropCount < tutDropLimit*3) {
		ctx.beginPath();
		ctx.arc(buttonX[but3], buttonY[but3], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(buttonX[but2], buttonY[but2], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
	} else if (tutDropCount < tutDropLimit*4) {
		ctx.beginPath();
		ctx.arc(buttonX[but3], buttonY[but3], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(buttonX[but2], buttonY[but2], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(buttonX[but1], buttonY[but1], DEFECT_RADIUS+addition, 0, 2*Math.PI);
		ctx.fill();
	} else {
		tutDropCount = 0;
		//reset Counter
	}
	tutDropCount++;
}

function goodLuck() {
	start3a=false, start2b=false, balls=[], electronCount=0;
}
