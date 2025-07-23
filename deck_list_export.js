//(function () {
function addButtonContainer() {
    const container = document.querySelector('.flex.my-2.px-5');
    const newDiv = document.createElement('div');
    newDiv.className = 'flex flex-row';
    newDiv.id = 'new-features-container';
    newDiv.style.marginLeft = 'auto';

    container.appendChild(newDiv);
}

function addExportAllRemoveErrataButton() {
    // Find the container with the two buttons
    const container = document.querySelector('#new-features-container');
    if (!container) return;

    // Create the Export All & remove Erratas button
    const exportBtn = document.createElement('button');
    exportBtn.title = 'Remove erratas and save to a zip file';
    exportBtn.textContent = 'Export All & Remove Erratas';
    exportBtn.className = 'export-all-erratas-btn flex flex-col justify-center transition-colors hover:bg-purple-700 cursor-pointer bg-slate-800 border-[1px] border-slate-700 p-2 ml-2';

    exportBtn.addEventListener('click', function () {
        downloadDecks(null, replaceAllDeckErratas);
    });

    // Insert as the last child
    container.appendChild(exportBtn);
}

/**
 * Adds an "Export All" button to the UI, which allows users to download all decks as a zip file.
 * The button is styled and added to a specific container within the page.
 * Clicking the button triggers the downloadDecks function to start the export process.
 */
function addExportAllButton() {
    // Find the container with the two buttons
    const container = document.querySelector('#new-features-container');
    if (!container) return;

    // Create the Export All button
    const exportBtn = document.createElement('button');
    exportBtn.title = 'Export all decks to a zip file';
    exportBtn.textContent = 'Export All';
    exportBtn.className = 'export-all-btn flex flex-col justify-center transition-colors hover:bg-purple-700 cursor-pointer bg-slate-800 border-[1px] border-slate-700 p-2 ml-2';

    exportBtn.addEventListener('click', function () {
        downloadDecks();
    });

    // Insert as the last child
    container.appendChild(exportBtn);
}
//})();