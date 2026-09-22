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

    let selectedOption = document.querySelector("input[name=question1]:checked");

    if (selectedOption && selectedOption.value === "Chrome") {
        question1Feedback.textContent = "Correct!";
        question1Feedback.style.color = "lightgreen";
        question1Image.src = "images/check.png";
        question1Image.alt = "Correct";
        question1Image.style.display = "inline";
        score += 20;
    } else {
        question1Feedback.textContent = "Wrong. The answer is Chrome.";
        question1Feedback.style.color = "red";
        question1Image.src = "images/x.png";
        question1Image.alt = "Incorrect";
        question1Image.style.display = "inline";
    }

    if (question2Input.value === "p" || question2Input.value === "P") {
        question2Feedback.textContent = "Correct!";
        question2Feedback.style.color = "lightgreen";
        question2Image.src = "images/check.png";
        question2Image.alt = "Correct";
        question2Image.style.display = "inline";
        score += 20;
    } else {
        question2Feedback.textContent = "Wrong. The answer is p.";
        question2Feedback.style.color = "red";
        question2Image.src = "images/x.png";
        question2Image.alt = "Incorrect";
        question2Image.style.display = "inline";
    }

    if (question3Input.value === "CSS") {
        question3Feedback.textContent = "Correct!";
        question3Feedback.style.color = "lightgreen";
        question3Image.src = "images/check.png";
        question3Image.alt = "Correct";
        question3Image.style.display = "inline";
        score += 20;
    } else {
        question3Feedback.textContent = "Wrong. The answer is CSS.";
        question3Feedback.style.color = "red";
        question3Image.src = "images/x.png";
        question3Image.alt = "Incorrect";
        question3Image.style.display = "inline";
    }

    if (+question4Input.value === 6) {
        question4Feedback.textContent = "Correct!";
        question4Feedback.style.color = "lightgreen";
        question4Image.src = "images/check.png";
        question4Image.alt = "Correct";
        question4Image.style.display = "inline";
        score += 20;
    } else {
        question4Feedback.textContent = "Wrong. The answer is 6.";
        question4Feedback.style.color = "red";
        question4Image.src = "images/x.png";
        question4Image.alt = "Incorrect";
        question4Image.style.display = "inline";
    }

    if (htmlOption.checked && cssOption.checked && pythonOption.checked == false) {
        question5Feedback.textContent = "Correct!";
        question5Feedback.style.color = "lightgreen";
        question5Image.src = "images/check.png";
        question5Image.alt = "Correct";
        question5Image.style.display = "inline";
        score += 20;
    } else {
        question5Feedback.textContent = "Wrong. The answers are HTML and CSS.";
        question5Feedback.style.color = "red";
        question5Image.src = "images/x.png";
        question5Image.alt = "Incorrect";
        question5Image.style.display = "inline";
    }

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