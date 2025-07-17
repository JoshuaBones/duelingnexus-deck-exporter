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
    const response = await fetch(`/api/list-decks.php`);// This is the only available way to retrieve decks from the server(to my knowledge)
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
 * Downloads all decks as a zip file or one as ydk if an id is included
 * 
 * @param {String} id - The id of the deck to download, default is null which will download all decks
 * @param {Function} preProcessDecks - A function that can be used to modify the decks before downloading, takes an array of decks and returns nothing
 */
async function downloadDecks(id=null, preProcessDecks = (decks) => {}) {
    const decks = await retrieveDecks(id);
    if (decks.length === 0) return 0; // Nothing to do

    preProcessDecks(decks);

    // Download single deck as ydk
    if (id !== null && decks.length === 1) {
        downloadFile(`${decks[0].name}.ydk`, buildDeckTextFromServer(decks));
        return 0;
    }

    // Download all decks as a zip file
    var zip = new JSZip();

    decks.forEach(deck => {
        //console.log(`${deck.name}`);
        zip.file(`${deck.name}.ydk`, buildDeckTextFromServer(deck));
    });

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        downloadFile("duelingnexus_decks.zip", content);
    });
}


/**
 * Replaces all errata ids in all decks with their corresponding normal id
 * @param {Array<Object>} decks - Deck object returned by the server
 */
function replaceAllDeckErratas(decks) {
    // Normal Id and Errata Id in order. May change to include multiple normal ids eventually (search blue-eyes as an example)
    // Todo: These vars are used in two places. Put them in one
    const normalIds = [
      88264978, 53183600, 15894048, 75745607, 40737112, 47297616, 5645210, 61468779,
      76862289, 38369349, 22446869, 91842653, 9596126, 89111398, 82841979, 28563545,
      90960358, 21785144, 2356994, 95727991, 20932152, 58996430, 40473581, 96235275,
      40044918, 48092532, 42940404, 2134346, 41006930, 89312388, 22624373, 21593977,
      44178886, 75043725, 47025270, 65622692, 64500000, 65458948, 96300057, 55821894,
      40695128, 3370104, 38538445, 43543777, 44364207, 38975369, 14878871, 65240384,
      67159705, 43586926, 48148828, 45894482, 7183277, 95503687, 26202165, 77084837,
      23265594, 2420921, 16226786, 9126351, 78349103, 9156135, 21502796, 56840658,
      45452224, 12538374, 34471458, 76263644, 91998119, 10248389, 99724761, 2111707,
      25119460, 99414168, 64631466, 25862681, 7391448, 50321796, 70583986, 29071332,
      66403530, 68005187, 87910978, 80168720, 17655904, 69279219, 77565204, 16762927,
      24294108, 16227556, 90502999, 96316857, 12923641, 59237154, 45247637, 47355498,
      71645242, 94634433, 15800838, 37580756, 81210420, 29389368, 80604091, 9995766,
      68540058, 40172183, 13955608
    ];
    const errataIds = [
      130000007, 130000052, 130000080, 130000022, 130000060, 130000028, 130000110,
      130000061, 130000043, 130000081, 130000062, 130000104, 130000075, 130000011,
      130000044, 130000082, 130000105, 130000018, 130000019, 130000021, 130000002,
      130000053, 130000039, 130000026, 130000008, 130000005, 130000031, 130000009,
      130000038, 130000016, 130000030, 130000090, 130000014, 130000083, 130000071,
      130000099, 130000100, 130000106, 130000101, 130000088, 130000033, 130000000,
      130000017, 130000024, 130000025, 130000020, 130000046, 130000064, 130000086,
      130000059, 130000072, 130000079, 130000010, 130000029, 130000045, 130000023,
      130000076, 130000036, 130000001, 130000040, 130000032, 130000065, 130000051,
      130000089, 130000027, 130000041, 130000015, 130000013, 130000096, 130000078,
      130000097, 130000091, 130000092, 130000074, 130000095, 130000003, 130000048,
      130000047, 130000058, 130000012, 130000057, 130000037, 130000049, 130000055,
      130000068, 130000035, 130000050, 130000067, 130000069, 130000077, 130000084,
      130000102, 130000103, 130000108, 130000034, 130000004, 130000006, 130000042,
      130000054, 130000070, 130000085, 130000093, 130000056, 130000063, 130000087,
      130000094, 130000113
    ];

    decks.forEach((deck, deckI) => {
        errataIds.forEach((errataId, idx) => {
            const errataIdStr = errataId.toString();
            const normalIdStr = normalIds[idx].toString();

            // Todo: improve this
            if(deck.main_deck.includes(errataIdStr)) {
                decks[deckI].main_deck = deck.main_deck.replace(new RegExp(errataIdStr, 'g'), normalIdStr);
            }
            if(deck.extra_deck.includes(errataIdStr)) {
                decks[deckI].extra_deck = deck.extra_deck.replace(new RegExp(errataIdStr, 'g'), normalIdStr);
            }
            if(deck.side_deck.includes(errataIdStr)) {
                decks[deckI].side_deck = deck.side_deck.replace(new RegExp(errataIdStr, 'g'), normalIdStr);
            }
        });
    })
}