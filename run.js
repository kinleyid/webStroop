
var decoded = decodeURIComponent(window.location.search);
var pID = decoded.substring(decoded.indexOf('=')+1);
var filename = pID + "Stroop";

var useScreenButtons = false;
var useKeyboard = true;
var colourNames = ["Red","Blue","Yellow","Green"];
var correspondingColours = ["red","blue","yellow","green"];
var correspondingKeys = ["KeyR","KeyB","KeyY","KeyG"];
// var nFixationCrossFrames = 120;
var fixationMs = 2000;
// var nFeedbackFrames = 120;
var feedbackMs = 2000;
var noRptsWithin = 2;
var gamify = true;

// Use the addMix() function to generate stimuli.
// It takes 2 arguments, the proportion of congruent stimuli
// and the number of stimuli to generate. It returns 2 arrays,
// "shuffledOrRand" and "derived." The first is an array of
// colour names with each colour represented equally if the
// number of stimuli is a multiple of the number of colours
// (otherwise it's just random. "derived" is an array of
// colour names that either match or don't match the entries
// in "shuffledOrRand", with order randomized and the proportions
// determined by the first input to the getMixed function.

var colours = [], words = []; // Global variables that addMix() pushed onto
addMix(1,8,noRptsWithin);
addMix(0,8,noRptsWithin);
addMix(0.5,8,noRptsWithin);
var masterWords = words;
var masterColours = colours;
var practiceWords = ["Red","Yellow","Blue","Green"];
var practiceColours = ["Red","Blue","Yellow","Green"];

var presented;
var selection;
var presentationTime;
var responseTime;
var reactionTime;

var isPractice = true;
var trialCount;
var outputText = "Trial,Word,Colour,Selection,PresentationTime,ResponseTime,NewLine,";

var ALL = document.getElementsByTagName("html")[0];
var dialogArea = document.getElementById("dialogArea");
var textArea = document.getElementById("textArea");
var buttonArea = document.getElementById("buttonArea");
var scoreBar = document.getElementById("scoreBar");
var scoreCtx = scoreBar.getContext('2d');
scoreCtx.canvas.width = 41;
scoreCtx.canvas.height = window.innerHeight;
// var stopId;
var pointsBarStopId;
var score = 0;
var scoreArea = document.getElementById("scoreArea");


var maxPoints = 100, currPoints;
var pointsBarTimeIncr = 16.67; // Roughly screen rate
var addPointsTimeIncr = 16.67; // Roughly screen rate

var cIdx;

if(useScreenButtons){
    for(cIdx = 0; cIdx < colourNames.length; cIdx++){
        var button = document.createElement("button");
        button.className = "colourButton";
        button.innerHTML = colourNames[cIdx];
        button.onclick = function(e) {moveOn(e)};
        document.getElementById("buttonArea").appendChild(button);
    }
}
    
var mutationObserver = new MutationObserver(function() {
	presentationTime = performance.now();
    if(colourNames.includes(textArea.innerHTML)){
        presented = true;
    }
});

mutationObserver.observe(document.getElementById("textArea"), {
	childList: true
});

window.onkeydown = moveOn;

function startPractice(){
    trialCount = 0;
    ALL.style.cursor = "none";
	words = practiceWords;
	colours = practiceColours;
	dialogArea.style.display = "none";
	textArea.style.display = "block";
	fixationCross();
    setTimeout(showWord, fixationMs);
}

function intermediaryScreen(){
    score = 0;
    scoreArea.innerHTML = "Score: " + score;
    ALL.style.cursor = "default";
	dialogArea.style.display = "block";
	textArea.style.display = "none";
	buttonArea.style.display = "none";
	dialogArea.innerHTML = "<p class='dialog'>That was the end of the practice round.</br>\
                                              Click to start the game for real.</p>\
                                              <button onclick='startTask()'>Start game</button>"
}

function startTask(){
    trialCount = 0;
    ALL.style.cursor = "none";
    score = 0;
    scoreArea.innerHTML = "Score: " + score;
	words = masterWords;
	colours = masterColours;
	isPractice = false;	
	dialogArea.style.display = "none";
	textArea.style.display = "block";
	fixationCross();
	setTimeout(fixationMs, showWord);
}

function fixationCross(){
	textArea.style.color = "#000000";
	textArea.innerHTML = "\u2022";
}

function showWord(){
	buttonArea.style.display = "block";
	textArea.style.color = correspondingColours[colourNames.indexOf(colours[trialCount])];
	textArea.innerHTML = words[trialCount];
    if(gamify){
        currPoints = maxPoints;
        pointsBarStopId = setTimeout(showPointsBar,pointsBarTimeIncr);
    }
}

function showPointsBar(){
    scoreCtx.clearRect(0,0,scoreCtx.canvas.width,scoreCtx.canvas.height);
    if(currPoints > 0){
        scoreCtx.fillStyle = "rgb(" + 255*(maxPoints-currPoints)/maxPoints + "," + 255*currPoints/maxPoints + ",0)";
        scoreCtx.fillRect(20,screen.height/4+screen.height/2*(1-currPoints/maxPoints),20,currPoints/maxPoints*screen.height/2);
        currPoints--;
        pointsBarStopId = setTimeout(showPointsBar,pointsBarTimeIncr);
    }
}

function moveOn(e){
    if(!presented){
        return;
    }
    if(e.code){ //KeyPress
        if(useKeyboard){
            if(correspondingKeys.includes(e.code)){
                selection = colourNames[correspondingKeys.indexOf(e.code)];
            } else {
                return; // Didn't select one of the designated keys
            }
        } else {
            return;
        }
    } else if(e.target.className == 'colourButton'){ // Screen button
        // useScreenButtons is implicitly true
        selection = e.target.innerHTML;
    } else {
        return;
    }
    presented = false;
    if(gamify){
        scoreCtx.clearRect(0,0,scoreCtx.canvas.width,scoreCtx.canvas.height);
        // window.cancelAnimationFrame(stopId);
        clearTimeout(pointsBarStopId);
    }
	responseTime = e.timeStamp;
	outputText += (isPractice? 0 : trialCount + 1) + "," +
                  words[trialCount] + "," +
				  colours[trialCount] + "," +
				  selection + "," +
                  presentationTime + "," +
                  responseTime + ",NewLine,";
	trialCount++;
	buttonArea.style.display = "none";
	if(trialCount == words.length){
		if(isPractice){
			if(gamify){
				feedbackScreen();
			} else {
				intermediaryScreen();
			}
		} else {
            if(gamify){
				feedbackScreen();
			} else {
				fixationCross();
                setTimeout(showWord, fixationMs);
			}
		}
		return;
	}
	if(gamify){
        feedbackScreen();
	} else {
		fixationCross();
        setTimeout(showWord, fixationMs);
	}
}

function feedbackScreen(){ // gamify = true is implicit
	if(selection == colours[trialCount-1]){
		textArea.innerHTML = "Correct!";
        addPoints();
	} else {
		textArea.innerHTML = "Incorrect";
        if(isPractice){
            ALL.style.cursor = 'default';
            trialCount--; // Re-do this trial
            textArea.innerHTML += ".<br/>Pick the colour the word is written in.";
            textArea.innerHTML += "<button onclick='nextWordOrFinishPractice()'>Try again</button>";
            return;
        }
        if(trialCount == words.length){
            if(isPractice){
                intermediaryScreen();
            } else {
                saveData();
            }
        } else {
            fixationCross();
            setTimeout(showWord, fixationMs);
        }
	}
}

nextWordOrFinishPractice = function(){
    if(trialCount == words.length){
        intermediaryScreen();
    } else {
        ALL.style.cursor = 'none';
        fixationCross();
        setTimeout(showWord, fixationMs);
    }
}

function addPoints(){
    if(currPoints > 0){
        score++;
        scoreArea.innerHTML = "Score: " + score;
        setTimeout(addPoints,addPointsTimeIncr);
        currPoints--;
    } else {
        setTimeout(
            function(){
                if(trialCount == words.length){
                    if(isPractice){
                        intermediaryScreen();
                    } else {
                        saveData();
                    }
                } else {
                    fixationCross();
                    setTimeout(showWord, fixationMs);
                }
            }, feedbackMs
        );
    }
}

function addMix(congruentPpn,nTrials,noRptsWithin){
	var isCongruent = Array(Math.floor(nTrials*congruentPpn)).fill(true).concat(Array(Math.ceil(nTrials*(1-congruentPpn))).fill(false));
	isCongruent = sample(isCongruent,isCongruent.length,false);
	var i, usableColours, usableWords, currWord, currColour;
	for(i = 0; i < isCongruent.length; i++){
		if(isCongruent[i]){
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

function sample(inArray,nSamples,replacement){
	sampleArray = inArray.slice(0);
	var i, idx, outArray = [];
	for(i = 0; i < nSamples; i++){
		idx = Math.floor(Math.random()*sampleArray.length);
		outArray.push(sampleArray[idx]);
		if(!replacement){
			sampleArray.splice(idx,1);
		}
	}
	return outArray;
}
