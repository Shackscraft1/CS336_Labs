let platformFilters = document.querySelectorAll("input[name=platform]");
let categoryFilter = document.querySelector("#categoryFilter");
let resetGameButton = document.querySelector("#resetGameButton");
let pageFilter = document.querySelector("#pageFilter");
let gameResults = document.querySelector("#gameResults");

let gameList = [];
let pageSize = 10;

async function searchGames() {
    let selectedPlatform = document.querySelector("input[name=platform]:checked");
    let platform = "";

    if (selectedPlatform) {
        platform = selectedPlatform.value;
    }

    if (platform === "" && categoryFilter.value === "") {
        resetGameResults();
        return;
    }

    let url = "https://www.freetogame.com/api/games?";

    if (platform !== "") {
        url += "platform=" + platform;
    }

    if (categoryFilter.value !== "") {
        if (platform !== "") {
            url += "&";
        }

        url += "category=" + categoryFilter.value;
    }

    try {
        gameResults.textContent = "Loading...";

        let response = await fetch(url);

        if (response.ok === false) {
            throw new Error("API error");
        }

        gameList = await response.json();

        createPages();
        displayGames();
    } catch (error) {
        gameList = [];
        pageFilter.innerHTML = "<option value='1'>Page 1</option>";
        gameResults.textContent = "The games could not be loaded.";
    }
}

function createPages() {
    pageFilter.innerHTML = "";

    let numberOfPages = Math.ceil(gameList.length / pageSize);

    if (numberOfPages === 0) {
        numberOfPages = 1;
    }

    for (let i = 1; i <= numberOfPages; i++) {
        let option = document.createElement("option");

        option.value = i;
        option.textContent = "Page " + i;

        pageFilter.appendChild(option);
    }
}

function displayGames() {
    gameResults.innerHTML = "";

    if (!gameList.length) {
        gameResults.textContent = "No games found.";
        return;
    }

    let pageNumber = +pageFilter.value;
    let pageStartIndex = (pageNumber - 1) * pageSize;
    let pageEndIndex = Math.min(gameList.length, pageStartIndex + pageSize);
    let pageGames = gameList.slice(pageStartIndex, pageEndIndex);

    for (let i = 0; i < pageGames.length; i++) {
        let result = document.createElement("div");
        let image = document.createElement("img");
        let title = document.createElement("h3");
        let information = document.createElement("p");

        result.className = "resultCard";
        image.src = pageGames[i].thumbnail;
        image.alt = pageGames[i].title;
        title.textContent = pageGames[i].title;
        information.textContent = "Genre: " + pageGames[i].genre +
          " | Platform: " + pageGames[i].platform;

        result.appendChild(image);
        result.appendChild(title);
        result.appendChild(information);
        gameResults.appendChild(result);
    }
}

function resetGameResults() {
    gameList = [];
    gameResults.innerHTML = "";
    pageFilter.innerHTML = "<option value='1'>Page 1</option>";
}

function resetGameFilters() {
    categoryFilter.value = "";

    for (let i = 0; i < platformFilters.length; i++) {
        platformFilters[i].checked = false;
    }

    resetGameResults();
}

for (let i = 0; i < platformFilters.length; i++) {
    platformFilters[i].addEventListener("change", searchGames);
}

categoryFilter.addEventListener("change", searchGames);
pageFilter.addEventListener("change", displayGames);
resetGameButton.addEventListener("click", resetGameFilters);

resetGameFilters();