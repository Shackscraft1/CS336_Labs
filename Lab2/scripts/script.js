console.log("Whoa");

//make a variable called answer with a value of 48
//set aside a space named answer that has 48 in it
let randomDecimal = Math.random();
let randomRange = randomDecimal * 99;
let answer = parseInt(randomRange) + 1;
let guesses = "";
let triesLeft = 6;

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

    guesses += " " + guessInput.value;
    previousGuesses.textContent = guesses;
    guessMessage.textContent = "";
    if (+guessInput.value === answer){
        
        guessMessage.textContent = winMessage;
        if (triesLeft > 0) guessMessage.textContent += " ---- You did it before 7 tries, wow!!!";
        guessMessage.style.color = "green";
        guessButton.disabled = true;


    }else if(+triesLeft === 0){
        guessButton.disabled = true;
        guessMessage.textContent = "You've ran out of guess womp womp :( "
        guessMessage.style.color = "red";
    }else if(+guessInput.value < answer){
        guessMessage.textContent = "Wrong guess. Your guess was too low. " + guessMessage.textContent;
        guessMessage.style.color = "red";
    }else {
        guessMessage.textContent = "Wrong guess. Your guess was too high." + guessMessage.textContent;
        guessMessage.style.color = "red";
    }

    //this changes the variable's value so it's one less than it used to be
    triesLeft -= 1; //-=, +=, /=, *=

    console.log(triesLeft);

});