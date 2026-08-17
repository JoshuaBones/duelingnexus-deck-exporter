//open a deck and search with
//Limit: Pre-Errata
//Results: All
//then paste this and put the file in the same folder as this js file

const results = document.querySelectorAll('#editor-search-results .editor-search-result');

const lines = Array.from(results).map(result => {
    const name = result.querySelector('.template-name')?.textContent.trim();

    // Search all attributes in the result for a card image URL.
    let id = null;

    for (const element of result.querySelectorAll('*')) {
        for (const attr of element.attributes) {
            const match = attr.value.match(/\/(\d+)\.jpg(?:[?#]|$)/);

            if (match) {
                id = match[1];
                break;
            }
        }

        if (id) break;
    }

    if (!id || !name) return null;

    return `${id}|${name}`;
}).filter(Boolean);

const output = lines.join('\n');

const blob = new Blob([output], { type: 'text/plain' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'errata_cards.txt';
a.click();

URL.revokeObjectURL(url);

console.log(`Found ${lines.length} cards.`);
console.log(output);