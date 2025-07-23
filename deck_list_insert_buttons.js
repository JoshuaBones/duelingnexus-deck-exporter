(function () {
    function addAllButtons() {
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
                //addImportMultipleButton();
                addExportAllRemoveErrataButton();
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
    }

    addAllButtons();
})();