(function () {
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

    function generateDeckText(deck) {
        const lines = ['#created by ...', '#main'];
        lines.push(...deck.main_deck.split(','));
        lines.push('#extra', ...deck.extra_deck.split(','));
        lines.push('!side', ...deck.side_deck.split(','));
        return lines.join('\n');
    }

    // This is the only available way to retrieve decks from the server(to my knowledge)
    // Returns all decks or one if the id is included
    // I've chosen to leave it like this, where it calls for every deck download, in case the user changes a list and downloads without reloading the page
    async function retrieveDecks(id=-1) {
        const response = await fetch(`/api/list-decks.php`);
        const data = await response.json();
        if (data.success) {
            if (id === -1) {
                return data.decks;
            } else {
                return data.decks.find(deck => deck.id === id);
            }
        }
        return data.success ? data.decks : [];
    }
    //downloads all decks as a zip file or one as ydk if an id is included
    async function downloadDecks(id=-1) {
        const decks = await retrieveDecks(id);
        if (decks.length === 0) return 0; // Nothing to do
        console.log('got decks');
        if (id !== -1) {
            // Download single deck as ydk
            downloadFile(`${decks.name}.ydk`, generateDeckText(decks));
            return 0;
        }

        var zip = new JSZip();

        decks.forEach(deck => {
            console.log(`${deck.name}`);
            zip.file(`${deck.name}.ydk`, generateDeckText(deck));
        });

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            downloadFile("duelingnexus_decks.zip", content);
        });
    }
    


    //export all button
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
            console.log('starting');
            downloadDecks();
        });

        // Insert as the last child
        container.appendChild(exportBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addExportAllButton);
    } else {
        addExportAllButton();
    }

    //Todo: add export button for each individual deck
    //Modularize code (downloadFile)
})();