const index = new FlexSearch.Document({
    doc: {
        id: "title",
        field: ["title", "author"],
        language: "de"
    }
});

async function loadKey(key) {
    let response = await fetch(`./data/${key}.json`);
    let data = await response.json();
    index.import(key, data);
}

(async () => {
    await Promise.all([
        loadKey('author.cfg'),
        loadKey('author.ctx'),
        loadKey('author.map'),
        loadKey('reg'),
        loadKey('title.cfg'),
        loadKey('title.ctx'),
        loadKey('title.map'),
    ]);
    const searchInput = document.getElementById('search');
    searchInput.disabled = false;
    searchInput.placeholder = "Artikelnamen suchen..."
    searchInput.focus();
    const articles = Array.from(document.querySelectorAll('td a'));
    searchInput.addEventListener('input', () => {
        let results = "";
        for (const result of index.search(searchInput.value, 10)) {
            if (result.field !== "title") { continue; } // TODO
            for (const articleTitle of result.result) {
                const link = articles.find((article) => { return article.textContent === articleTitle });
                if (link) {
                    results += link.outerHTML;
                }
            }
        }
        document.getElementById('results').innerHTML = results;
    });
})();

