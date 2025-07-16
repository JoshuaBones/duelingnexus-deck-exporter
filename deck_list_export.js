(function () {
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
     * Generate a .ydk file text from a deck object returned by the server
     * @param {Object} deck - The deck object returned by the server
     * @returns {String} The text of the .ydk file
     */
    function generateDeckText(deck) {
        const lines = ['#created by ...', '#main'];
        lines.push(...deck.main_deck.split(','));
        lines.push('#extra', ...deck.extra_deck.split(','));
        lines.push('!side', ...deck.side_deck.split(','));
        return lines.join('\n');
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
     * @param {Number} id - The id of the deck to download, default is null which will download all decks
     */
    async function downloadDecks(id=null) {
        const decks = await retrieveDecks(id);
        if (decks.length === 0) return 0; // Nothing to do

        // Download single deck as ydk
        if (id !== null && decks.length === 1) {
            downloadFile(`${decks[0].name}.ydk`, generateDeckText(decks));
            return 0;
        }

        // Download all decks as a zip file
        var zip = new JSZip();

        decks.forEach(deck => {
            //console.log(`${deck.name}`);
            zip.file(`${deck.name}.ydk`, generateDeckText(deck));
        });

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            downloadFile("duelingnexus_decks.zip", content);
        });
    }
    
    /**
     * Adds an "Export All" button to the UI, which allows users to download all decks as a zip file.
     * The button is styled and added to a specific container within the page.
     * Clicking the button triggers the downloadDecks function to start the export process.
     */
    function addExportAllButton() {
        // Find the container with the two buttons
        const container = document.querySelector('.flex.my-2.px-5');
        if (!container) return;

        // Create the Export All button
        const exportBtn = document.createElement('button');
        exportBtn.title = 'Export all decks to a zip file';
        exportBtn.textContent = 'Export All';
        exportBtn.className = 'export-all-btn flex flex-col justify-center transition-colors hover:bg-purple-700 cursor-pointer bg-slate-800 border-[1px] border-slate-700 p-2 ml-2';
        // Style to push it to the far right
        exportBtn.style.marginLeft = 'auto';

        exportBtn.addEventListener('click', function () {
            downloadDecks();
        });

        // Insert as the last child
        container.appendChild(exportBtn);
    }


    // Monitor for changes on the home page, and dynamically add the Export All button when the deck list is loaded. Due to the nature of Vue, which I don't have access to, this is the best I/ai can come up with
    const appElement = document.getElementById('app');
    const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (   mutation.type === 'childList'
            && mutation.addedNodes.length === 1
            && mutation.addedNodes[0].baseURI === "https://duelingnexus.com/decks"
            && mutation.addedNodes[0].nodeName === "DIV"
            && mutation.addedNodes[0].className === "flex justify-center items-center w-full") {
            addExportAllButton();
            //Todo: add export button for each individual deck
        }
    }
    });

    const config = {
    childList: true,
    subtree: false
    };
    observer.observe(appElement, config);

    //Todo: Modularize code (downloadFile, etc.)
    //"Export All & Remove Erratas" button
})();