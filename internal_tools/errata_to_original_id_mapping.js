// This gets run in the console of the deck editor page. It spits out data that's put into normalIds and errataIds in the errata_toggle.js file.

// Step 1: Get errata IDs
const errataIds = Object.keys(Engine.database.cards)
  .map(Number)
  .filter(id => id > 130000000);//may need ceiling eventually, depending on what the site adds

// Step 2: Build name → original ID map
const nameToOriginalId = {};

for (const id in Engine.database.cards) {
    const card = Engine.database.cards[id];

    if (card.id < 100000000) {
        if (!nameToOriginalId[card.name]) {
            nameToOriginalId[card.name] = card.id;
        }
    }
}

// Step 3: Map errata → original IDs (or null)
const matchedOriginalIds = errataIds.map(errataId => {
    const errataCard = Engine.database.cards[errataId];
    if (!errataCard) return null;

    return nameToOriginalId[errataCard.name] ?? null;
});

// Step 4: Logs
console.log("Errata IDs:", errataIds);
console.log("Matched Original IDs:", matchedOriginalIds);

console.log("Errata IDs count:", errataIds.length);
console.log("Matched Original IDs count:", matchedOriginalIds.length);