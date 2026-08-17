(function () {
  // Only add once
  if (document.getElementById('editor-errata-button')) return;

  // Insert this errata button next to the export button
  //const menu = document.getElementById('editor-menu-content');
  //const menu = document.querySelector('#editor-menu-content .editor-menu-column:last-of-type')
  const menu = document.querySelector('#editor-collapsible-buttons-menu')
  if (!menu) return;

  // Contains errata toggle and dropdown
  const wrapper = document.createElement('div');
  wrapper.id = 'editor-errata-button';
  wrapper.style.display = 'inline-flex';
  wrapper.style.position = 'relative';


  const btn = document.createElement('button');
  btn.id = 'errata-button';
  btn.textContent = 'Erratas'; // Longer text doesn't look good, so added a tooltip
  btn.className = 'engine-button engine-button-navbar engine-button-default ';//editor-button-navbar';
  btn.title = "Toggle Goat/Edison Erratas (other simulators don't use the same card ids)";
  btn.style.borderTopRightRadius = '0';
  btn.style.borderBottomRightRadius = '0';

  btn.addEventListener('click', function () {
    // Normal Id and Errata Id in order. May change to include multiple normal ids eventually (search blue-eyes as an example)

    Editor.updateDeck();// User adding a card after page load, then clicking toggle does not update Deck object. Basically ensure Deck object is up-to-date before doing anything

    // Get Deck object from page. This feature wouldn't be possible without access to it and Editor, which is why injection is necessary
    const Deck = window.Deck;
    if (!Deck) return;

    /**
     * Finds errata matches in a deck section, putting them in a map of format {deckArrIndex: errataIdsIndex}.
     * deckArr is one of these three: main/extra/side
     * 
     * @param {Array<number>} deckArr - Array of card IDs to search through.
     * @param {Array<number>} ids - Array of IDs to match against.
     * @returns {Object} An object mapping indices of matches in deckArr to their indices in ids.
     */
    function findMatches(deckArr, ids) {
      const map = {};
      deckArr.forEach((id, idx) => {
        const foundIdx = ids.indexOf(id);
        if (foundIdx !== -1) map[idx] = foundIdx;
      });
      return map;
    }

    // Start of dealing with erratas
    // Try errataIds first
    let foundType = null;
    let mainMap = findMatches(Deck.main, ERRATA_IDS.errataIds);
    let extraMap = findMatches(Deck.extra, ERRATA_IDS.errataIds);
    let sideMap = findMatches(Deck.side, ERRATA_IDS.errataIds);

    // Look at the vars above ^ and if they have any matches, then we're converting errata to normal ids
    if (Object.keys(mainMap).length || Object.keys(extraMap).length || Object.keys(sideMap).length) {
      foundType = 'errata';
    } else {
      // Try normalIds
      mainMap = findMatches(Deck.main, ERRATA_IDS.normalIds);
      extraMap = findMatches(Deck.extra, ERRATA_IDS.normalIds);
      sideMap = findMatches(Deck.side, ERRATA_IDS.normalIds);
      // Any matches and we're going from normal ids to erratas
      if (Object.keys(mainMap).length || Object.keys(extraMap).length || Object.keys(sideMap).length) {
        foundType = 'normal';
      }
    }

    if (!foundType) return; // Nothing to do

    // Set swap logic - the ids to swap to
    const toIds = foundType === 'errata' ? ERRATA_IDS.normalIds : ERRATA_IDS.errataIds;

  /**
   * Swaps card IDs in a specific deck section based on a mapping of indices.
   *
   * Iterates over the provided map of indices, removes the card at each index
   * in the specified section, and adds a new card ID from the `toIds` array.
   * If the index equals the length of the deck array, the card is added to the end.
   * 
   * @param {string} section - The section of the deck to modify (e.g., 'main', 'extra', 'side').
   * @param {Object} map - An object mapping indices in the deck array to indices in the toIds array.
   * @param {Array<number>} deckArr - The array of card IDs representing the current deck section.
   */
    function swapSection(section, map, deckArr) {
      for (const [idxStr, idIdx] of Object.entries(map)) {
        let idx = parseInt(idxStr, 10);
        Editor.removeCard(section, idx);
        if (idx == deckArr.length) idx = -1;//Add to end instead(Deck object is fine but editor-decks-column imgs don't play nice)
        Editor.addCard(toIds[idIdx], section, idx, true);
      }
    }

    swapSection('main', mainMap, Editor.main);
    swapSection('extra', extraMap, Editor.extra);
    swapSection('side', sideMap, Editor.side);
    Editor.updateDeck(); // The Deck object does not update without this, even though visually the page does
  });


  // Right dropdown toggle button
  const dropdownButton = document.createElement('button');
  dropdownButton.innerHTML = '▼';
  dropdownButton.className = 'engine-button engine-button-navbar engine-button-default';
  dropdownButton.style.borderTopLeftRadius = '0';
  dropdownButton.style.borderBottomLeftRadius = '0';
  dropdownButton.style.width = '32px';//40, 28


  // Dropdown options container
  const ddOptionContainer = document.createElement('div');
  ddOptionContainer.style.display = 'none';
  ddOptionContainer.style.position = 'absolute';
  ddOptionContainer.style.top = '100%';
  ddOptionContainer.style.right = '0';
  ddOptionContainer.style.background = '#2c2c2c';
  ddOptionContainer.style.borderRadius = '6px';
  ddOptionContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  ddOptionContainer.style.overflow = 'hidden';
  ddOptionContainer.style.zIndex = '1000';

  // Dropdown option
  const item = document.createElement('div');
  item.textContent = 'Replace Alt-Arts';
  item.title = "Not all alt-arts export to other simulators. Edison mode doesn't work with them either.";
  item.style.padding = '8px 12px';
  item.style.cursor = 'pointer';
  item.style.color = '#fff';
  item.addEventListener('mouseover', () => item.style.background = '#444');
  item.addEventListener('mouseout', () => item.style.background = '');
  item.addEventListener('click', () => {
    ddOptionContainer.style.display = 'none';

    replaceAltArts();
  });
  ddOptionContainer.appendChild(item);

  dropdownButton.addEventListener('click', (e) => {
    e.stopPropagation();
    ddOptionContainer.style.display = ddOptionContainer.style.display === 'block' ? 'none' : 'block';
  });

  // Hide menu when clicking outside
  document.addEventListener('click', () => {
    ddOptionContainer.style.display = 'none';
  });


  // Assemble and insert
  wrapper.appendChild(btn);
  wrapper.appendChild(dropdownButton);
  wrapper.appendChild(ddOptionContainer);


  //smaller screens wrap the buttons, so give them a little more rooom. This spacer was recently removed by DnX
  //document.getElementById('editor-menu-spacer').style.width = '0%';//'10%';//'18%';
  //always want it before the export button for looks
  const exportBtn = document.getElementById('editor-export-button');
  if (exportBtn) {
    menu.insertBefore(/*btn*/wrapper, exportBtn);
    document.querySelector('#editor-errata-button').style.marginRight = '5px';
  } else {
    menu.appendChild(wrapper);//btn);
  }
})();