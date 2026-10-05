let signupForm = document.querySelector("#signupForm");
let zipCodeInput = document.querySelector("#zipCode");
let cityInfo = document.querySelector("#cityInfo");
let latitudeInfo = document.querySelector("#latitudeInfo");
let longitudeInfo = document.querySelector("#longitudeInfo");
let zipMessage = document.querySelector("#zipMessage");

let stateInput = document.querySelector("#state");
let countyInput = document.querySelector("#county");

let usernameInput = document.querySelector("#username");
let usernameMessage = document.querySelector("#usernameMessage");

let passwordInput = document.querySelector("#password");
let suggestedPassword = document.querySelector("#suggestedPassword");
let passwordError = document.querySelector("#passwordError");

async function getData(url) {
    let response = await fetch(url);
    return await response.json();
}

async function loadStates() {
    let data = await getData("https://csumb.space/api/allStatesAPI.php");

    for (let i = 0; i < data.length; i++) {
        stateInput.innerHTML += "<option value='" + data[i].usps + "'>" + data[i].state + "</option>";
    }
}

loadStates();

zipCodeInput.addEventListener("change", async function() {
    let data = await getData("https://csumb.space/api/cityInfoAPI.php?zip=" + zipCodeInput.value);

    if (data) {
        cityInfo.textContent = "City: " + data.city;
        latitudeInfo.textContent = "Latitude: " + data.latitude;
        longitudeInfo.textContent = "Longitude: " + data.longitude;
        zipMessage.textContent = "";
    } else {
        cityInfo.textContent = "City:";
        latitudeInfo.textContent = "Latitude:";
        longitudeInfo.textContent = "Longitude:";
        zipMessage.textContent = "Zip code was not found.";
    }
});

stateInput.addEventListener("change", async function() {
    countyInput.innerHTML = "<option value=''>Select County</option>";

    if (stateInput.value === "") {
        return;
    }

    let data = await getData("https://csumb.space/api/countyListAPI.php?state=" + stateInput.value);

    for (let i = 0; i < data.length; i++) {
        countyInput.innerHTML += "<option>" + data[i].county + "</option>";
    }
});

usernameInput.addEventListener("change", async function() {
    if (usernameInput.value === "") {
        usernameMessage.textContent = "";
        return;
    }

    let data = await getData("https://csumb.space/api/usernamesAPI.php?username=" + usernameInput.value);

    if (data.available) {
        usernameMessage.textContent = "Username is available!";
        usernameMessage.style.color = "lightgreen";
    } else {
        usernameMessage.textContent = "Username is not available.";
        usernameMessage.style.color = "red";
    }
});

passwordInput.addEventListener("click", async function() {
    let data = await getData("https://csumb.space/api/suggestedPassword.php?length=8");
    suggestedPassword.textContent = "Suggested Password: " + data.password;
});

passwordInput.addEventListener("input", function() {
    if (passwordInput.value.length > 0 && passwordInput.value.length < 6) {
        passwordError.textContent = "Password must have at least six characters.";
    } else {
        passwordError.textContent = "";
    }
});

signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (passwordInput.value.length < 6) {
        passwordError.textContent = "Password must have at least six characters.";
    }
});