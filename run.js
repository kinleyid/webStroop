
var filename;
var colourNames = ["Red","Blue","Yellow","Green"];
var correspondingColours = ["red","blue","yellow","green"];
var correspondingKeys = ["KeyR","KeyB","KeyY","KeyG"];
var fixationMs = 2000;
var noRptsWithin = 2;
var gamify = true;
if (gamify) {
    var feedbackMs = 2000;   
} else {
    var interTrialMs = 2000;
}
var isPractice = true; // Set to false to eliminate practice round

// Use the addStimuli() function to generate stimuli.
// It takes 3 arguments:
// 1. the proportion of matching stimuli to generate
// 2. the number of stimuli to generate
// 3. the number of trials within no repeats of a word or colour are allowed

var colours = words = new Array();// Global variables that addStimuli() pushes onto
addStimuli(1, 8, noRptsWithin);
addStimuli(0, 8, noRptsWithin);
addStimuli(0.5, 8, noRptsWithin);
var masterWords = words;
var masterColours = colours;
if (isPractice) {
    var practiceWords = ["Red", "Yellow", "Blue", "Green"];
    var practiceColours = ["Red", "Blue", "Yellow", "Green"];
}

var stimulusHasBeenPresented = false;
var selection;
var presentationTime;
var trialCount;
var outputText = "Trial,Word,Colour,Selection,PresentationTime,ResponseTime,NewLine,";

var ALL = document.getElementsByTagName("html")[0];
var dialogArea = document.getElementById("dialogArea");
var centeredArea = document.getElementById("centeredArea");
var textArea = document.getElementById("textArea");
var scoreBar = document.getElementById("scoreBar");
var scoreCtx = scoreBar.getContext('2d');
scoreCtx.canvas.width = 41;
scoreCtx.canvas.height = window.innerHeight;
var pointsBarStopId;
var score = 0;
var scoreArea = document.getElementById("scoreArea");


var maxPoints = 100, currPoints;
var pointsBarTimeIncr = 1000/60; // Roughly screen rate
var addPointsTimeIncr = 1000/60; // Roughly screen rate

var cIdx;

window.onkeydown = respondToInput;

function start() {
    trialCount = 0;
    if (gamify) {
        score = 0;
    }
    if (isPractice) {
        words = practiceWords;
        colours = practiceColours;
    } else {
        words = masterWords;
        colours = masterColours;
    }
    ALL.style.cursor = "none";
    dialogArea.style.display = "none";
	textArea.style.display = "block";
    fixationCross();
    setTimeout(showWord, fixationMs);
}

function afterPracticeScreen() {
    if (gamify) {
        score = 0;
        scoreArea.textContent = "Score: " + score;
    }
    ALL.style.cursor = "default";
    while (dialogArea.lastChild) {
        dialogArea.removeChild(dialogArea.lastChild);
    }
    var dialog1 = document.createElement('p');
    dialog1.className = 'dialog';
    dialog1.textContent = 'That was the end of the practice round.';
    var dialog2 = document.createElement('p');
    dialog2.className = 'dialog';
    dialog2.textContent = 'Click to start the game for real.';
    var startButton = document.createElement('button');
    startButton.textContent = 'Start game';
    startButton.onclick = start;
    dialogArea.appendChild(dialog1);
    dialogArea.appendChild(dialog2);
    dialogArea.appendChild(startButton);
    dialogArea.style.display = "block";
	textArea.style.display = "none";
}

function fixationCross() {
	textArea.style.color = "#000000";
	textArea.textContent = "\u2022";
}

function showWord() {
	textArea.style.color = correspondingColours[colourNames.indexOf(colours[trialCount])];
	textArea.textContent = words[trialCount];
    stimulusHasBeenPresented = true;
    if (gamify) {
        currPoints = maxPoints;
        scoreBar.style.display = 'block';
        pointsBarStopId = setTimeout(showPointsBar,pointsBarTimeIncr);
    }
    presentationTime = performance.now();
}

function runTrial() {
    ALL.style.cursor = 'none';
    dialogArea.style.display = 'none';
    textArea.style.display = 'block';
    fixationCross();
    setTimeout(showWord, fixationMs);
}

function showPointsBar() {
    scoreCtx.clearRect(0,0,scoreCtx.canvas.width,scoreCtx.canvas.height);
    if (currPoints > 0) {
        scoreCtx.fillStyle = "rgb(" + 255*(maxPoints-currPoints)/maxPoints + "," + 255*currPoints/maxPoints + ",0)";
        scoreCtx.fillRect(20,screen.height/4+screen.height/2*(1-currPoints/maxPoints),20,currPoints/maxPoints*screen.height/2);
        currPoints--;
        pointsBarStopId = setTimeout(showPointsBar,pointsBarTimeIncr);
    }
}

function respondToInput(inputEvent) {
    if (!stimulusHasBeenPresented) {
        return;
    } else {
        stimulusHasBeenPresented = false;
        if(correspondingKeys.includes(inputEvent.code)){
            selection = colourNames[correspondingKeys.indexOf(inputEvent.code)];
        } else {
            return; // Didn't select one of the designated keys
        }
    }
    if (gamify) {
        scoreCtx.clearRect(0,0,scoreCtx.canvas.width,scoreCtx.canvas.height);
        scoreBar.style.display = 'none';
        clearTimeout(pointsBarStopId);
    }
	outputText += (isPractice? 0 : trialCount + 1) + "," +
                  words[trialCount] + "," +
				  colours[trialCount] + "," +
				  selection + "," +
                  presentationTime + "," +
                  inputEvent.timeStamp + ",NewLine,";
    interTrialControlFcn();
}

function interTrialControlFcn() {
    trialCount++;
    if (trialCount == words.length) {
        if (isPractice) {
            feedbackScreen(afterPracticeScreen);
        } else if (gamify) {
            feedbackScreen(saveData);
        } else {
            textArea.style.display = 'none';
            setTimeout(runTrial, interTrialMs);
        }
    } else {
        if (isPractice || gamify) {
            feedbackScreen(runTrial);
        } else {
            textArea.style.display = 'none';
            setTimeout(runTrial, interTrialMs);
        }
    }
}

function feedbackScreen(nextFunction) {
    while (dialogArea.lastChild) {
        dialogArea.removeChild(dialogArea.lastChild);
    }
    textArea.style.display = 'none';
    dialogArea.style.display = 'block';
    var feedback = document.createElement('p');
    feedback.className = 'dialog';
	if (selection == colours[trialCount-1]) {
        feedback.textContent = 'Correct!';
        dialogArea.appendChild(feedback);
        addPoints(nextFunction);
	} else {
        feedback.textContent = 'Incorrect.';
        dialogArea.appendChild(feedback);
        if (isPractice) {
            ALL.style.cursor = 'default';
            trialCount--; // Re-do this trial
            var instructions = document.createElement('p');
            instructions.className = 'dialog';
            instructions.textContent = 'Pick the colour the word is written in.';
            dialogArea.appendChild(instructions);
            var tryAgainButton = document.createElement('button');
            tryAgainButton.textContent = 'Try again';
            tryAgainButton.onclick = runTrial;
            dialogArea.appendChild(tryAgainButton);
            return;
        }
        setTimeout(nextFunction, feedbackMs);
	}
}

function addPoints(nextFunction) {
    if (currPoints > 0) {
        currPoints--;
        scoreArea.textContent = "Score: " + score++;
        setTimeout(
            function() {
                addPoints(nextFunction)
            },
            addPointsTimeIncr
        );
    } else {
        setTimeout(nextFunction, feedbackMs);
    }
}

function saveData() {
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.status == 200) {
            window.location.href = 'end.html?pID=' + pID;
        } else if(xhttp.status == 500) {
            saveData();
        }
    };
    xhttp.open("POST", "saveData.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    VarsToSend = "filename="+filename + "&txt="+outputText;
    xhttp.send(VarsToSend);
}

function addStimuli(congruentPpn, nTrials, noRptsWithin) {
	var isCongruent = Array(Math.floor(nTrials*congruentPpn)).fill(true).concat(Array(Math.ceil(nTrials*(1-congruentPpn))).fill(false));
	isCongruent = sample(isCongruent,isCongruent.length,false);
	var i, usableColours, usableWords, currWord, currColour;
	for (i = 0; i < isCongruent.length; i++) {
		if (isCongruent[i]) {
			usableColours = colourNames.filter(x => !words.slice(Math.max(0,words.length-noRptsWithin+1)).includes(x) &&
													!colours.slice(Math.max(0,colours.length-noRptsWithin+1)).includes(x))
			currColour = sample(usableColours,1,true)[0];
			colours.push(currColour);
			words.push(currColour);
		} else {
			usableColours = colourNames.filter(x => !colours.slice(Math.max(0,colours.length-noRptsWithin+1)).includes(x))
            currColour = sample(usableColours,1,true)[0]
			colours.push(currColour);
			usableWords = colourNames.filter(x => x != currColour && !words.slice(Math.max(0,words.length-noRptsWithin+1)).includes(x))
            currWord = sample(usableWords,1,true)[0]
			words.push(currWord);
		}
	}
}

function sample(inArray,nSamples,replacement) {
	sampleArray = inArray.slice(0);
	var i, idx, outArray = [];
	for (i = 0; i < nSamples; i++) {
		idx = Math.floor(Math.random()*sampleArray.length);
		outArray.push(sampleArray[idx]);
		if (!replacement) {
			sampleArray.splice(idx,1);
		}
	}
	return outArray;
}