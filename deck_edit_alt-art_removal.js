(function () {
  /**
   * Finds alt arts in a deck section array (main/extra/side), putting results in a map of format {index: normalId}.
   * Example: Dark Magician alt art (46986417) found in position 5, so {5: 46986414(original to replace with)}
   * What's the point? Not all alt-arts export to other simulators. Even this site's Edison mode doesn't allow decks with them.
   * 
   * @param {Array<number>} deckArr - Array of card IDs to search through. (main/extra/side)
   * @returns {map} Returns positions of cards to be replaced, as well as what to replace them with. {5(position): 46986414(original to replace with)}
   */
  function findAltArts(deckArr) {
      const map = {};
      deckArr.forEach((id, idx) => {
        const alias = Engine.database.cards[id].alias;

        if(alias != 0) {
          map[idx] = alias; // Store the index and the original ID to replace with
        }
      });
      return map;
  }

  /**
   * Replaces cards in one of main/extra/side with replacements
   * Example: If the main deck has an alt-art(46986417) in position 5, pass {5: 46986414} to replace it with the original ID.
   * @param {string} section - Deck section to modify ('main', 'extra', 'side').
   * @param {Object} replacements - map of {position: replacementCardId}
   */
  function editorReplace(section, replacements) {
    for (const [position, newCardId] of Object.entries(replacements)) {
    //replacements.forEach((newCardId, position) => {
      Editor.removeCard(section, position);
      const newPosition = position == Editor[section].length ? -1 : position; // If last card in arr removed, must use -1 for reasons
      Editor.addCard(newCardId, section, newPosition, true);
    };
  }

  /**
   * Replaces all alt-art cards in the deck with their normal art version.
   * Useful for exporting to other simulators that don't support alt-arts.
   * Even Edison mode on DuelingNexus doesn't work with alt-arts.
   */
  window.replaceAltArts = function() { // The errata toggle button needs access
    Editor.updateDeck();//ensured Deck is updated, as user making changes sometimes doesn't update it

    const deck = window.Deck;
    if (!deck) return;

    for (let section in deck) {
      if (Array.isArray(deck[section])) {//main/extra/side
        const changesToMake = findAltArts(deck[section]);
        editorReplace(section, changesToMake);
      }
    }

    Editor.updateDeck();
  }
})();