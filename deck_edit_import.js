(function () {
    /**
     * Adds an array of cards to a specified deck section. Makes use of the built-in Editor in DuelingNexus.
     * 
     * @param {string} section - Deck section to add to ('main', 'extra', 'side').
     * @param {Array<number>} cards - An array of card IDs.
     */
    function addCardsToSection(section, cards) {
        console.log(section, cards);
        cards.forEach(cardId => {
            Editor.addCard(cardId, section, -1, true);
        });
    }

    /**
     * Overwrites the current deck with the given one.
     * Clears the deck, adds the cards to their respective sections, and updates the Deck object.
     * @param {Object} deck - New deck. Should have main, extra, and side properties.
     */
    function overwriteDeck(deck) {
        Editor.updateDeck();

        //only confirm if the Deck has card(s). Unfortunately the editor's Clear button doesn't change the size of the Deck object, so the above line is necessary
        if ((Deck.main.length > 0 || Deck.extra.length > 0 || Deck.side.length > 0) && !confirm("Are you sure you want to overwrite your deck?")) { return; }
        Editor.clear();
        
        addCardsToSection('main', deck.main);
        addCardsToSection('extra', deck.extra);
        addCardsToSection('side', deck.side);

        Editor.updateDeck();

        console.log('Overwriting deck with:', deck);
    }

    /// Adds paste listener which runs when the paste event happens and no input element is focused
    document.addEventListener('paste', function (event) {
        const active = document.activeElement;
        const isNothingFocused =
            active === document.body ||
            active === null ||
            active === document.documentElement;

        if (isNothingFocused) {
            const pastedText = (event.clipboardData || window.clipboardData).getData('text');
            //console.log('Pasted inside #editor-decks-column:', pastedText);

            try {
                const deck = parseURL(pastedText);

                overwriteDeck(deck);
            } catch (error) {
                console.error('Error parsing deck from pasted text:', error);
                alert('Error parsing deck. Please check the format.');
            }
        }
    });

    function addImportYdkeToExportButton() {
        const menu = document.querySelector('#editor-export-button > div');// Export Button's dropdown menu

        const item2 = document.createElement('div');
        item2.textContent = 'Import YDKe';
        item2.style.padding = '8px 12px';
        item2.style.cursor = 'pointer';
        item2.style.color = '#fff';
        item2.addEventListener('mouseover', () => item2.style.background = '#444');
        item2.addEventListener('mouseout', () => item2.style.background = '');
        item2.addEventListener('click', () => {
        menu.style.display = 'none';

        try {
            const ydke  = prompt('Paste YDKe URL here:');//deck_edit_import.js
            if(ydke === null || ydke === '') return;

            // Make use of external library
            const deck = parseURL(ydke);

            overwriteDeck(deck)
            showMessage('YDKe import successful!', true, 1.5);
        } catch (err) {
            console.error('Error importing YDKe:', err);
            showMessage('YDKe import failed', false, 3);
        }
        });

        menu.appendChild(item2);
    }

    // Run on page load to dynamically add button
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addExportButton);
    } else {
        addImportYdkeToExportButton();
    }
})();