let question2Input = document.querySelector("#question2");
let question3Input = document.querySelector("#question3");
let question4Input = document.querySelector("#question4");

let htmlOption = document.querySelector("#html");
let cssOption = document.querySelector("#css");
let pythonOption = document.querySelector("#python");

let question1Feedback = document.querySelector("#question1Feedback");
let question2Feedback = document.querySelector("#question2Feedback");
let question3Feedback = document.querySelector("#question3Feedback");
let question4Feedback = document.querySelector("#question4Feedback");
let question5Feedback = document.querySelector("#question5Feedback");

let question1Image = document.querySelector("#question1Image");
let question2Image = document.querySelector("#question2Image");
let question3Image = document.querySelector("#question3Image");
let question4Image = document.querySelector("#question4Image");
let question5Image = document.querySelector("#question5Image");

let submitButton = document.querySelector("#submitButton");
let scoreMessage = document.querySelector("#scoreMessage");
let congratulationMessage = document.querySelector("#congratulationMessage");
let totalAttemptsMessage = document.querySelector("#totalAttemptsMessage");

let checkboxChoices = document.querySelectorAll(".checkboxChoice");

for (let i = 0; i < checkboxChoices.length; i++) {
    checkboxChoices[i].style.order = parseInt(Math.random() * 100);
}

let totalAttempts = localStorage.getItem("totalAttempts");

if (totalAttempts === null) {
    totalAttempts = 0;
}

totalAttemptsMessage.textContent = "Total Times Quiz Was Taken: " + totalAttempts;

submitButton.addEventListener("click", function () {
    let score = 0;

    function checkAnswer(correct, feedback, image, wrongMessage) {
        if (correct) {
            feedback.textContent = "Correct!";
            feedback.style.color = "lightgreen";
            image.src = "images/check.png";
            image.alt = "Correct";
            score += 20;
        } else {
            feedback.textContent = wrongMessage;
            feedback.style.color = "red";
            image.src = "images/x.png";
            image.alt = "Incorrect";
        }

        image.style.display = "inline";
    }

    let selectedOption = document.querySelector("input[name=question1]:checked");

    checkAnswer(
        selectedOption && selectedOption.value === "Chrome",
        question1Feedback,
        question1Image,
        "Wrong. The answer is Chrome."
    );

    checkAnswer(
        question2Input.value === "p" || question2Input.value === "P",
        question2Feedback,
        question2Image,
        "Wrong. The answer is p."
    );

    checkAnswer(
        question3Input.value === "CSS",
        question3Feedback,
        question3Image,
        "Wrong. The answer is CSS."
    );

    checkAnswer(
        +question4Input.value === 6,
        question4Feedback,
        question4Image,
        "Wrong. The answer is 6."
    );

    checkAnswer(
        htmlOption.checked && cssOption.checked && pythonOption.checked == false,
        question5Feedback,
        question5Image,
        "Wrong. The answers are HTML and CSS."
    );

    scoreMessage.textContent = "Score: " + score;

    if (score > 80) {
        congratulationMessage.textContent = "Congratulations! You got a perfect score!";
    } else {
        congratulationMessage.textContent = "";
    }

    totalAttempts = +totalAttempts + 1;
    localStorage.setItem("totalAttempts", totalAttempts);
    totalAttemptsMessage.textContent = "Total Times Quiz Was Taken: " + totalAttempts;
});