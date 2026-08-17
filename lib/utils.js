/**
 * Download a file using a blob
 * @param {String} filename - The name of the file to download
 * @param {String} content - The content of the file to download
 */
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

/**
 * Builds .ydk text from an array of main, extra and side deck card IDs.
 * @param {Array<number>} main - The main deck card IDs.
 * @param {Array<number>} extra - The extra deck card IDs.
 * @param {Array<number>} side - The side deck card IDs.
 * @returns {string} The .ydk deck text.
 */
function buildDeckText(main, extra, side) {
    const lines = ['#created by ...', '#main'];
    lines.push(...main);
    lines.push('#extra', ...extra);
    lines.push('!side', ...side);
    return lines.join('\n');
}

/**
 * Builds .ydk text from a deck object returned by the server.
 * Unfortunately js doesn't support function overloading
 * @param {Object} deck - The deck object returned by the server
 * @returns {string} The .ydk deck text
 */
function buildDeckTextFromServer(deck) {
    return buildDeckText(deck.main_deck.split(','), 
                            deck.extra_deck.split(','), 
                            deck.side_deck.split(','));
}

/**
 * Retrieves all decks from the server, or a single deck if the id is included
 *
 * I've chosen to leave it like this, where it retrieves every deck when download is clicked(regardless of Export All or single (single deck hasn't been added yet)),
 * in case the user changes a deck and downloads without reloading the page
 * @param {Number} id - The id of the deck to retrieve, default is null which will retrieve all decks
 * @return {Promise<Array<Object>>} A promise that resolves to an array of deck(s), empty if none were found
 */
async function retrieveDecks(id=null) {
    const response = await fetch(`/api/list-decks.php`);// This is the only available way to retrieve decks from the server(to my knowledge). It gets every deck.
    const { success, decks } = await response.json();

    if (success) {
        if (id === null) {
            return decks;
        } else {
            const deck = decks.find(deck => deck.id === id);
            return deck === undefined ? [] : [deck];
        }
    }
    return [];
}

/**
 * Go from DnX's format to one closer to a ydk
 * @param {Array<Object>} decksFromServer - An array of deck objects from the server.
 * @returns {Array<Object>} Deck(s) in int format & with DnX's internal rarity removed
 */
function serverDecksToDeckObject(decksFromServer) {
    let mod =  1E11;//10000000000;
    return decksFromServer.map(deck => {
        const main = deck.main_deck === '' ? [] : deck.main_deck.split(',').map(str => parseInt(str, 10) % mod);
        const extra = deck.extra_deck === '' ? [] : deck.extra_deck.split(',').map(str => parseInt(str, 10) % mod);
        const side = deck.side_deck === '' ? [] : deck.side_deck.split(',').map(str => parseInt(str, 10) % mod);
        return {
            //id: deck.id,
            name: deck.name,
            main: main,
            extra: extra,
            side: side
        };
    });
}

/**
 * Downloads all decks as a zip file or one as ydk if an id is included
 * 
 * @param {String} id - The id of the deck to download, default is null which will download all decks
 * @param {Function} deckPreProcesseses - Function(s) that can be used to modify the decks before downloading, takes an array of decks and returns nothing
 */
async function downloadDecks(id=null, deckPreProcesseses=null) {
    const decksfromServer = await retrieveDecks(id);
    if (decksfromServer.length === 0) return 0; // Nothing to do
    const decks = serverDecksToDeckObject(decksfromServer);

    if (deckPreProcesseses) {
        for(const callback of deckPreProcesseses) {
            await callback(decks);
        }
    }

    // Download single deck as ydk
    if (id !== null && decks.length === 1) {
        downloadFile(`${decks[0].name}.ydk`, buildDeckText(decks[0].main, decks[0].extra, decks[0].side));
        return 0;
    }

    // Download all decks as a zip file
    var zip = new JSZip();

    //check for duplicate names and rename them if necessary, then save to zip
    decks.forEach(deck => {
        //console.log(`${deck.name}`);
        let newName = '';
        let count = 0;
        do {
            newName = count == 0 ? `${deck.name}.ydk` : `${deck.name} (${count}).ydk`;
            ++count;
        } while(zip.files[`${newName}`]);
        zip.file(`${newName}`, buildDeckText(deck.main, deck.extra, deck.side));
    });

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        downloadFile("duelingnexus_decks.zip", content);
    });
}


/**
 * Replaces all errata ids in all decks with their corresponding normal id
 * @param {Array<Object>} decks - Deck object returned by the server & formatted for ease of use
 */
function replaceAllDeckErratas(decks) {
    // Normal Id and Errata Id in order. May change to include multiple normal ids eventually (search blue-eyes as an example)

    decks.forEach((deck, deckI) => {//each deck
        ERRATA_IDS.errataIds.forEach((errataId, idx) => {//each errata id
            //const errataIdStr = errataId.toString();
            //const normalIdStr = normalIds[idx].toString();

            for (let section in deck) {//each deck property
                if (Array.isArray(deck[section])) {//ensure it's main/extra/side, and not 'name'
                    if (decks[deckI][section].includes(errataId/*Str*/)) {//check for efficiency
                        // Replace all instances of errataIdStr with its normal counterpart
                        const cards = deck[section];
                        for (let i = 0; i < cards.length; ++i) {
                            if(cards[i] == errataId/*Str*/) {
                                cards[i] = ERRATA_IDS.normalIds[idx];
                            }
                        }
                    }
                }
            }

            // Todo: improve this
            /*if(deck.main.includes(errataIdStr)) {
                decks[deckI].main = deck.main.replace(new RegExp(errataIdStr, 'g'), normalIdStr);
            }
            if(deck.extra.includes(errataIdStr)) {
                decks[deckI].extra = deck.extra.replace(new RegExp(errataIdStr, 'g'), normalIdStr);
            }
            if(deck.side.includes(errataIdStr)) {
                decks[deckI].side = deck.side.replace(new RegExp(errataIdStr, 'g'), normalIdStr);
            }*/
        });
    })
}

/**
 * Replaces all alt-art cards in the given decks with their original counterparts.
 * @param {Array<Object>} decks - Array of deck objects to modify.
 * @returns {Promise<void>}
 */
async function replaceAllDeckAltArts(decks) {
    const response = await fetch('/assets/data/cards.json');//get card data in json
    const data = await response.json();
    
    decks.forEach((deck, deckI) => {//each deck
        for (let section in deck) {//property
            if (Array.isArray(deck[section])) {//main/extra/side, not name
                const cards = deck[section];

                cards.forEach((cardId, index) => {//main, extra or side's cards
                    //const intCardId = parseInt(cardId, 10);//json has ints, while we have strings
                    
                    const cardData = data.cards.find(c => c.id === /*intC*/cardId);//^card data from json
                    /*if(typeof cardData === 'undefined') {
                        console.log(`${cardId} not found in ${deck.name} ${section} ${index}`)
                    }*/
                    try {
                        if('undefined' !== typeof cardData && 'als' in cardData && cardData.als != 0) {//als references the original card's id, but does not exist if it's the original
                            cards[index] = cardData.als.toString();
                        }
                    }
                    catch(e) {
                        console.log(e);
                    }
                });
            }
        }
    });
}

async function removeAllNotFoundIds(decks) {
    const response = await fetch('/assets/data/cards.json');//get card data in json
    const data = await response.json();

    decks.forEach((deck, deckI) => {//each deck
        for (let section in deck) {//property
            if (Array.isArray(deck[section])) {//main/extra/side, not name
                const cards = deck[section];

                for(let i = cards.length - 1; i >= 0; --i) {
                    const cardData = data.cards.find(c => c.id === cards[i]);//^card data from json
                    if(typeof cardData === 'undefined') {
                        console.log(`Card not found, removing ${cards[i]} in ${deck.name} ${section} ${i}`)
                        cards.splice(i, 1);
                    }
                }
            }
        }
    });
}