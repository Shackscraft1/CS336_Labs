console.log("Whoa");

//make a variable called answer with a value of 48
//set aside a space named answer that has 48 in it
let answer = parseInt(Math.random() * 99) + 1;
let guesses = "";
let triesLeft = 7;
let gamesWon = 0;
let gamesLost = 0;

const winMessage = "Congratulations you guessed it";
//look up an elemnt with an id of guess Message(#gUESSmESSAGE
//and bind it ot a variable name guesMessage)
let guessMessage = document.querySelector("#guessMessage");

console.log(answer);
//making a function sets aside the code so you can run it later
//it's anamed bloc of code, it starts and ends with curly braces
function showWin(){
    //equals(*) i njavascript means change the value
    //change the text inside an element
    guessMessage.textContent = winMessage; 

    //the style object in any element lets you change CSS stuff
    //change the color of the font to green
    guessMessage.style.color = "green";

}

// a function name with with pparenthese after it.
//makes the function happen immediately

//showWin();

let guessButton = document.querySelector("#guessButton");
let resetButton = document.querySelector("#resetButton");
let gamesWonText = document.querySelector("#gamesWon");
let gamesLostText = document.querySelector("#gamesLost");
//guessButton.addEventListener("click", showWin);

//shorthand
//this makes it so when you click on guess button, the function showWin happens
//---guessButton.addEventListener("click", showWin);


//shorthand 
let guessInput = document.querySelector("#guessInput");
let previousGuesses = document.querySelector("#previousGuesses");



//Question operators
// == match - the left and right have to match values for the answer to be yes
// != not match - the left and right have to be different for the answer to be yes
// === strict match - the left right have to have the same value and type for the answer to be yes

//the + converts the text in the input box to a number
// we compare to the answer to see if they match
// +guessInput.value === answer

guessButton.addEventListener('click', function () {

    let currentGuess = +guessInput.value;

    if (currentGuess < 1 || currentGuess > 99){
        guessMessage.textContent = "Please enter a number between 1 and 99.";
        guessMessage.style.color = "red";
        return;
    }

    guesses += " " + currentGuess;
    previousGuesses.textContent = guesses;
    guessMessage.textContent = "";

    //this changes the variable's value so it's one less than it used to be
    triesLeft -= 1;

    if (currentGuess === answer){
        
        guessMessage.textContent = winMessage;
        guessMessage.style.color = "green";
        gamesWon += 1;
        gamesWonText.textContent = gamesWon;
        guessButton.hidden = true;
        resetButton.hidden = false;


    }else if(triesLeft === 0){
        guessMessage.textContent = "You Lost! The number was " + answer;
        guessMessage.style.color = "red";
        gamesLost += 1;
        gamesLostText.textContent = gamesLost;
        guessButton.hidden = true;
        resetButton.hidden = false;
    }else if(currentGuess < answer){
        guessMessage.textContent = "Wrong guess. Your guess was too low. " + guessMessage.textContent;
        guessMessage.style.color = "red";
    }else {
        guessMessage.textContent = "Wrong guess. Your guess was too high." + guessMessage.textContent;
        guessMessage.style.color = "red";
    }

    console.log(triesLeft);

});

resetButton.addEventListener('click', function () {
    answer = parseInt(Math.random() * 99) + 1;
    guesses = "";
    triesLeft = 7;
    guessInput.value = "";
    previousGuesses.textContent = "";
    guessMessage.textContent = "";
    guessMessage.style.color = "white";
    guessButton.hidden = false;
    resetButton.hidden = true;
});
