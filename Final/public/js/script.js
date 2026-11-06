const themeButton = document.getElementById('themeButton');
let theme = localStorage.getItem('umaTheme') || 'light';
document.documentElement.setAttribute('data-bs-theme', theme);

function showTheme() {
    themeButton.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

showTheme();
themeButton.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('umaTheme', theme);
    showTheme();
});

const charactersContainer = document.getElementById('characters');
let characters = [];
let currentPage = 1;
const pageSize = 10;

function showCharacters() {
    const search = document.getElementById('search').value.toLowerCase();
    const sort = document.getElementById('sort').value;
    const japanese = document.getElementById('japaneseNames').checked;
    let filtered = characters.filter(item =>
        (item.name_en || '').toLowerCase().includes(search) || (item.name_jp || '').includes(search)
    );

    if (sort === 'az') filtered.sort((a, b) => a.name_en.localeCompare(b.name_en));
    if (sort === 'za') filtered.sort((a, b) => b.name_en.localeCompare(a.name_en));
    if (sort === 'id') filtered.sort((a, b) => a.id - b.id);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    charactersContainer.innerHTML = '';

    for (const item of filtered.slice(start, start + pageSize)) {
        const column = document.createElement('article');
        column.className = 'col';
        const link = document.createElement('a');
        link.className = 'character-card text-center';
        link.href = '/character/' + item.id;
        const img = document.createElement('img');
        img.className = 'character-image mb-2';
        img.src = item.thumb_img || '/images/placeholder.svg';
        img.alt = item.name_en;
        img.onerror = () => { img.onerror = null; img.src = '/images/placeholder.svg'; };
        const name = document.createElement('p');
        name.className = 'mb-0';
        name.textContent = japanese && item.name_jp ? item.name_jp : item.name_en;
        link.append(img, name);
        column.appendChild(link);
        charactersContainer.appendChild(column);
    }

    document.getElementById('message').textContent = filtered.length + ' characters found';
    document.getElementById('pageNumber').textContent = 'Page ' + currentPage + ' of ' + totalPages;
    document.getElementById('previous').disabled = currentPage === 1;
    document.getElementById('next').disabled = currentPage === totalPages;
}

async function setupHome() {
    const search = document.getElementById('search');
    const sort = document.getElementById('sort');
    sort.value = localStorage.getItem('umaSort') || 'az';
    document.getElementById('filterForm').addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', () => { currentPage = 1; showCharacters(); });
    sort.addEventListener('change', () => {
        localStorage.setItem('umaSort', sort.value);
        currentPage = 1;
        showCharacters();
    });
    document.getElementById('japaneseNames').addEventListener('change', showCharacters);
    document.getElementById('previous').addEventListener('click', () => { currentPage--; showCharacters(); });
    document.getElementById('next').addEventListener('click', () => { currentPage++; showCharacters(); });

    try {
        const response = await fetch('/api/characters');
        if (!response.ok) throw new Error('API failed');
        characters = await response.json();
        showCharacters();
    } catch (err) {
        document.getElementById('message').textContent = 'Characters could not be loaded.';
    }
}

if (charactersContainer) setupHome();