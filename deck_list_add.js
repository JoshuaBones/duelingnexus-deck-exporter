//(function () {
function parseDeck(deckText) {
    const deck = {
        main: [],
        extra: [],
        side: []
    }
    let section = "main";// main/extra/side
    deckText.replace("\r", "").split("\n").forEach(line => {
        if(line.startsWith("#") || line.startsWith("!")) {//catches any commented line
            if(line == "#main" ||
                line == "#extra" ||
                line == "!side" ||
                line == "#side") {
                section = line.substring(1);//Set deck section as we go through each line
            }
        } else {
            const cardId = parseInt(line, 10);

            if (!isNaN(cardId)) {
                deck[section].push(line);// They convert to numbers in Nexus scripts, so we have to as well
            }
        }
    });

    //console.log(`Deck: ${deck.main} extra ${deck.extra} side ${deck.side}`);
    return deck;
}

async function getAllDecks(files) {
    const decks = [];
    for(let i = 0; i < files.length; i++) {
        try {
            const txt = await files[i].text();
            const deck = parseDeck(txt);

            const deckInfo = {
                name: files[i].name,
                deck: deck,
                uploadSuccess: false
            };

            decks.push(deckInfo);
        } catch(error) {
            //deck failed to parse, don't add
        }
    };
    return decks;
}

async function postDeck(deckInfo) {
    const payload = {
        deck: deckInfo.deck,
        name: deckInfo.name
    };

    const response = await fetch('/create-deck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if(!response.ok) {
        throw new Error(`Failed to upload ${deckInfo.name}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Deck created for ${deckInfo.name}:`, result);


}

async function uploadMultipleFiles(files) {
    const decks = await getAllDecks(files);

    for(let i = 0; i < decks.length; ++i) {
        try {
            await postDeck(decks[i]);
            decks[i].uploadSuccess = true;
        } catch(error) {
            //deck failed to upload
            console.log("failed post", error);
        }
    }

    console.log("done");
}



function addImportMultipleButton() {
    // Find the container
    const container = document.querySelector('#new-features-container');
    if (!container) return;

    // Create the Import Multiple button
    const importBtn = document.createElement('button');
    importBtn.title = 'Import multiple decks at once';
    importBtn.textContent = 'Import Multiple Decks';
    importBtn.id = 'import-multiple-btn';
    importBtn.className = 'flex flex-col justify-center transition-colors hover:bg-purple-700 cursor-pointer bg-slate-800 border-[1px] border-slate-700 p-2 ml-2';

    // File input element (hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.ydk';
    fileInput.style.display = 'none';

    importBtn.addEventListener('click', function () {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            uploadMultipleFiles(files);
        }
    });

    // Insert as the last child
    container.appendChild(importBtn);
    container.appendChild(fileInput);
}

//addImportMultipleButton();
//})();