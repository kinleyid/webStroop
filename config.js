var filename = 
var colourNames = ["Red","Blue","Yellow","Green"];
var correspondingColours = ["red","blue","yellow","green"];
var correspondingKeys = ["KeyR","KeyB","KeyY","KeyG"];
// var nFixationCrossFrames = 120;
var fixationMs = 2000;
// var nFeedbackFrames = 120;
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
// 3. the 

var colours = [], words = []; // Global variables that addStimuli() pushes onto
addStimuli(1, 8, noRptsWithin);
addStimuli(0, 8, noRptsWithin);
addStimuli(0.5, 8, noRptsWithin);
var masterWords = words;
var masterColours = colours;
if (isPractice) {
    var practiceWords = ["Red", "Yellow", "Blue", "Green"];
    var practiceColours = ["Red", "Blue", "Yellow", "Green"];
}