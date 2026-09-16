console.log("Whoa");

//make a variable called answer with a value of 48
//set aside a space named answer that has 48 in it
let answer = 48;

let guesses;

let triesLeft = 7;

const winMessage = "Congratulations you guessed it";


//look up an element with an id of guessMessage (#guessMessage)
//and bind it to a variable named guessMessage
let guessMessage = document.querySelector("#guessMessage");


//making a  function sets aside the code so you can run it later
//it's a named block of code, it starts and ends with curly braces
function showWin() {
    //equals (=) in javascript means change the value
    //change the text inside an element
    guessMessage.textContent = winMessage;

    //the style object in any element lets you change CSS stuff
    //change the color of the font to green
    guessMessage.style.color = "green";
}

//a function name with parentheses after it, 
//makes the funciton happen immediately
//showWin();


let guessButton = document.querySelector("#guessButton");
//this makes it so when you click on guess button, the function showWin happens
//---guessButton.addEventListener("click", showWin);


//shorthand 
guessButton.addEventListener('click', function () {
    guessMessage.textContent = winMessage;
    guessMessage.style.color = "green";

    
    //this changes the variable's value so it's one less than it used to be
    triesLeft -= 1; //-=, +=, /=, *=

    console.log(triesLeft);

});


let guessInput = document.querySelector("#guessInput");



//Question operators
// == match - the left and right have to match values for the answer to be yes
// != not match - the left and right have to be different for the answer to be yes
// === strict match - the left right have to have the same value and type for the answer to be yes

//the + converts the text in the input box to a number
// we compare to the answer to see if they match
+guessInput.value === answer


