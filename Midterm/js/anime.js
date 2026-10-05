let titleFilter = document.querySelector("#titleFilter");
let typeFilter = document.querySelector("#typeFilter");
let resetAnimeButton = document.querySelector("#resetAnimeButton");
let animeMessage = document.querySelector("#animeMessage");
let animeResults = document.querySelector("#animeResults");

async function searchAnime() {
    animeMessage.textContent = "";

    if (titleFilter.value === "" && typeFilter.value === "") {
        animeResults.innerHTML = "";
        return;
    }

    if (titleFilter.value.length > 30) {
        animeMessage.textContent = "The title cannot have more than 30 characters.";
        animeResults.innerHTML = "";
        return;
    }

    let url = "https://kitsu.io/api/edge/anime?page[limit]=10";

    if (titleFilter.value !== "") {
        url += "&filter[text]=" + titleFilter.value;
    }

    if (typeFilter.value !== "") {
        url += "&filter[subtype]=" + typeFilter.value;
    }

    try {
        animeResults.textContent = "Loading...";

        let response = await fetch(url);

        if (response.ok === false) {
            throw new Error("API error");
        }

        let result = await response.json();

        displayAnime(result.data);
    } catch (error) {
        animeResults.textContent = "The anime could not be loaded.";
    }
}

function displayAnime(animes) {
    animeResults.innerHTML = "";

    if (animes.length === 0) {
        animeResults.textContent = "No anime found.";
        return;
    }

    for (let i = 0; i < animes.length; i++) {
        let result = document.createElement("div");
        let image = document.createElement("img");
        let title = document.createElement("h3");
        let information = document.createElement("p");
        let episodes = animes[i].attributes.episodeCount;

        if (episodes === null) {
            episodes = "Unknown";
        }

        result.className = "resultCard";
        title.textContent = animes[i].attributes.canonicalTitle;
        information.textContent = "Type: " + animes[i].attributes.subtype +
          " | Episodes: " + episodes;

        if (animes[i].attributes.posterImage) {
            image.src = animes[i].attributes.posterImage.small;
            image.alt = animes[i].attributes.canonicalTitle;
            result.appendChild(image);
        }

        result.appendChild(title);
        result.appendChild(information);
        animeResults.appendChild(result);
    }
}

function resetAnimeFilters() {
    titleFilter.value = "";
    typeFilter.value = "";
    animeMessage.textContent = "";
    animeResults.innerHTML = "";
}

titleFilter.addEventListener("change", searchAnime);
typeFilter.addEventListener("change", searchAnime);
resetAnimeButton.addEventListener("click", resetAnimeFilters);

resetAnimeFilters();