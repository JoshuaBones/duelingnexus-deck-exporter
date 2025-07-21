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

            const deck = parseURL(pastedText);

            overwriteDeck(deck);
        }
    });
})();