(function () {
  // Only add once
  if (document.getElementById('editor-errata-button')) return;

  // Insert this errata button next to the export button
  //const menu = document.getElementById('editor-menu-content');
  const menu = document.querySelector('#editor-menu-content .editor-menu-column:last-of-type')
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
    const normalIds = [
      16226786, 20932152, 25862681, 47355498, 48092532, 71645242, 88264978, 40044918, 2134346,
      7183277, 89111398, 29071332, 76263644, 44178886, 34471458, 89312388, 38538445, 21785144,
      2356994, 38975369, 95727991, 75745607, 77084837, 43543777, 44364207, 96235275, 45452224,
      47297616, 95503687, 22624373, 42940404, 78349103, 40695128, 45247637, 69279219, 2420921,
      68005187, 41006930, 40473581, 9126351, 12538374, 94634433, 76862289, 82841979, 26202165,
      14878871, 50321796, 7391448, 87910978, 77565204, 21502796, 53183600, 58996430, 15800838,
      80168720, 80604091, 66403530, 70583986, 43586926, 40737112, 61468779, 22446869, 9995766,
      65240384, 9156135, 16762927, 17655904, 24294108, 37580756, 47025270, 48148828, 99414168,
      9596126, 23265594, 16227556, 10248389, 45894482, 15894048, 38369349, 28563545, 75043725,
      90502999, 81210420, 67159705, 68540058, 55821894, 56840658, 21593977, 2111707, 25119460,
      29389368, 40172183, 64631466, 91998119, 99724761, 65622692, 64500000, 96300057, 96316857,
      12923641, 91842653, 90960358, 65458948, 59237154, 5645210, 13955608, 32646477, 52035300
    ];
    const errataIds = [
      130000001, 130000002, 130000003, 130000004, 130000005, 130000006, 130000007, 130000008,
      130000009, 130000010, 130000011, 130000012, 130000013, 130000014, 130000015, 130000016,
      130000017, 130000018, 130000019, 130000020, 130000021, 130000022, 130000023, 130000024,
      130000025, 130000026, 130000027, 130000028, 130000029, 130000030, 130000031, 130000032,
      130000033, 130000034, 130000035, 130000036, 130000037, 130000038, 130000039, 130000040,
      130000041, 130000042, 130000043, 130000044, 130000045, 130000046, 130000047, 130000048,
      130000049, 130000050, 130000051, 130000052, 130000053, 130000054, 130000055, 130000056,
      130000057, 130000058, 130000059, 130000060, 130000061, 130000062, 130000063, 130000064,
      130000065, 130000067, 130000068, 130000069, 130000070, 130000071, 130000072, 130000074,
      130000075, 130000076, 130000077, 130000078, 130000079, 130000080, 130000081, 130000082,
      130000083, 130000084, 130000085, 130000086, 130000087, 130000088, 130000089, 130000090,
      130000091, 130000092, 130000093, 130000094, 130000095, 130000096, 130000097, 130000099,
      130000100, 130000101, 130000102, 130000103, 130000104, 130000105, 130000106, 130000108,
      130000110, 130000113, 130000114, 130000115
    ];

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
    let mainMap = findMatches(Deck.main, errataIds);
    let extraMap = findMatches(Deck.extra, errataIds);
    let sideMap = findMatches(Deck.side, errataIds);

    // Look at the vars above ^ and if they have any matches, then we're converting errata to normal ids
    if (Object.keys(mainMap).length || Object.keys(extraMap).length || Object.keys(sideMap).length) {
      foundType = 'errata';
    } else {
      // Try normalIds
      mainMap = findMatches(Deck.main, normalIds);
      extraMap = findMatches(Deck.extra, normalIds);
      sideMap = findMatches(Deck.side, normalIds);
      // Any matches and we're going from normal ids to erratas
      if (Object.keys(mainMap).length || Object.keys(extraMap).length || Object.keys(sideMap).length) {
        foundType = 'normal';
      }
    }

    if (!foundType) return; // Nothing to do

    // Set swap logic - the ids to swap to
    const toIds = foundType === 'errata' ? normalIds : errataIds;

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