const searchInput = document.getElementById('search');
const searchResultsElement = document.getElementById('results');
searchInput.disabled = false;
searchInput.placeholder = "Artikelnamen suchen..."
searchInput.focus();


let index = {children: [], articles: []};

function insert(string, rootNode, document) {
    const character = string.toLowerCase().slice(0, 1);
    if (!rootNode[character]) {
        const node = {children: [], articles: []};
        rootNode[character] = node;
        rootNode.children.push(node);
    }
    const node = rootNode[character];
    const rest = string.slice(1);
    if (rest) {
        insert(rest, node, document);
    } else {
        node.articles.push(document);
    }
}

function search(string, rootNode) {
    const character = string.toLowerCase().slice(0, 1);
    if (!character) {
        return getDocuments(rootNode);
    }
    const rest = string.slice(1);
    let results = rootNode[character] ? search(rest, rootNode[character]) : [];
    if (results.length > 20) { return results }
    for (const child of getChildren(rootNode)) {
        if (child === rootNode[character]) { continue }
        if (child[character]) {
            for (const result of search(rest, child[character])) {
                if (results.indexOf(result) === -1) {
                    results.push(result);
                }
            }
        }
        if (results.length > 20) { return results }
    }
    return results;
}

function getChildren(rootNode) {
    let children = rootNode.children;
    for (const child of children) {
        children = children.concat(getChildren(child));
    }

    return children;
}

function getDocuments(rootNode) {
    let articleList = rootNode.articles;
    for (const character of Object.keys(rootNode)) {
        if (character === 'articles' || character === 'children') {
            continue
        }
        articleList = articleList.concat(getDocuments(rootNode[character]));
    }
    return articleList;
}

for (const row of document.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td');
    if (!cells.length) {
        continue;
    }
    const content = cells[0].textContent.trim();
    const link = cells[0].querySelector('a');
    if (link) {
        const bereich = cells[1].textContent.trim();
        insert(content, index, [content, link.href, bereich]);
    }
}

searchInput.addEventListener('input', () => {
    requestAnimationFrame(() => {
        if (!searchInput.value) {
            searchResultsElement.innerHTML = '';
            return;
        }
        const searchResults = search(searchInput.value, index);
        if (!searchResults.length) {
            searchResultsElement.innerHTML = '<li>Keine Ergebnisse';
        } else {
            searchResultsElement.innerHTML = searchResults.map((result) => {
                return `<li><a href="${result[1]}" target="_blank">${result[0]} (${result[2]})</a></li>`
            }).join("");
        }
    });
});

searchInput.addEventListener('keydown', (event) => {
    let focusedSuggestion = searchResultsElement.querySelector('.active');
    switch (event.key) {
        case 'Enter':
            if (focusedSuggestion) {
                focusedSuggestion.querySelector('a')?.click();
            }
            event.preventDefault();
            break;
        case 'Escape':
            searchInput.value = '';
            searchResultsElement.innerHTML = '';
            break;
        case 'ArrowUp':
            if (!focusedSuggestion) {
                searchResultsElement.querySelector('li')?.classList.add('active');
            } else {
                focusedSuggestion.previousElementSibling?.classList.add('active');
                focusedSuggestion.classList.remove('active');
            }
            event.preventDefault();
            break;
        case 'ArrowDown':
            if (!focusedSuggestion) {
                searchResultsElement.querySelector('li')?.classList.add('active');
            } else {
                focusedSuggestion.nextElementSibling?.classList.add('active');
                focusedSuggestion.classList.remove('active');
            }
            event.preventDefault();
            break;
        case 'p':
            if (!event.ctrlKey) { return }
            if (!focusedSuggestion) {
                searchResultsElement.querySelector('li')?.classList.add('active');
            } else {
                focusedSuggestion.previousElementSibling?.classList.add('active');
                focusedSuggestion.classList.remove('active');
            }
            event.preventDefault();
            break;
        case 'n':
            if (!event.ctrlKey) { return }
            if (!focusedSuggestion) {
                searchResultsElement.querySelector('li')?.classList.add('active');
            } else {
                focusedSuggestion.nextElementSibling?.classList.add('active');
                focusedSuggestion.classList.remove('active');
            }
            event.preventDefault();
            break;
    }
});
