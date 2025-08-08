(function () {
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
            downloadDecks(null, [replaceAllDeckErratas]);
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
        exportBtn.className = 'export-all-btn transition-colors hover:bg-purple-700 cursor-pointer bg-slate-800 border-[1px] border-slate-700 p-2 ml-2';

        exportBtn.addEventListener('click', function () {
            const replaceErratas = document.getElementById('replace-erratas').checked;
            const replaceAltArts = document.getElementById('replace-alt-arts').checked;

            const deckPreProcesseses = [];
            if (replaceErratas) {
                deckPreProcesseses.push(replaceAllDeckErratas);
            }
            if (replaceAltArts) {
                deckPreProcesseses.push(replaceAllDeckAltArts);
            }

            downloadDecks(null, deckPreProcesseses);
        });


        // Create a settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.title = 'Export Settings';
        settingsBtn.innerHTML = '&#9881;';
        settingsBtn.className = 'settings-btn transition-colors hover:bg-purple-700 cursor-pointer bg-slate-800 border-[1px] border-slate-700 p-2 ml-2';
        settingsBtn.style.marginLeft = '0';

        // Create a popup div for settings
        const settingsPopup = document.createElement('div');
        //settingsPopup.className = 'settings-popup hidden';
        //settingsPopup.style = 'position: absolute; top: 100%; right: 0; background-color: #2c2c2c; padding: 20px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
        settingsPopup.style = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #2c2c2c;
            padding: 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            display: none;
            `;
        settingsPopup.innerHTML = `
            <h2>Export All - Settings</h2>
            <label>
                <input type="checkbox" id="replace-erratas">
                Replace Erratas
            </label><br/>
            <label>
                <input type="checkbox" id="replace-alt-arts">
                Replace Alt-Arts
            </label>
        `;

        settingsBtn.addEventListener('click', () => {
        if (settingsPopup.style.display === 'block') {
            settingsPopup.style.display = 'none';
        } else {
            settingsPopup.style.display = 'block';
        }
        });

        document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsPopup.contains(e.target)) {
            settingsPopup.style.display = 'none';
        }
        });

        // Create an overlay element
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';

        // Add an event listener to the overlay to close the modal
        overlay.addEventListener('click', function() {
        settingsPopup.style.display = 'none';
        overlay.remove();
        });

        // Add the overlay to the page when the modal is opened
        settingsBtn.addEventListener('click', function() {
        document.body.appendChild(overlay);
        settingsPopup.style.display = 'block';
        });


        // Insert as the last child
        container.appendChild(exportBtn);
        container.appendChild(settingsBtn);
        container.appendChild(settingsPopup);
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

            addButtonContainer();
            //addExportAllRemoveErrataButton();
            addExportAllButton();
            //Todo: add export button for each individual deck. Maybe not due to UI clutter
        }
    }
    });

    const config = {
    childList: true,
    subtree: false
    };
    observer.observe(appElement, config);
})();