(function () {
  // Only add once
  if (document.getElementById('errata-button')) return;

  // Insert button next to export
  const menu = document.getElementById('editor-menu-content');
  if (!menu) return;

  const btn = document.createElement('button');
  btn.id = 'errata-button';
  btn.textContent = 'Erratas'; // Longer text doesn't look good, so added a tooltip
  btn.className = 'engine-button engine-button-navbar engine-button-default editor-button-navbar';
  btn.title = "Toggle Goat/Edison Erratas (other simulators don't use the same card ids)";

  btn.addEventListener('click', function () {
    // Normal Id and Errata Id in order. May change to include multiple normal ids eventually
    const normalIds = window.normalIds || [
      88264978, 53183600, 15894048, 75745607, 40737112, 47297616, 5645210, 61468779,
      76862289, 38369349, 22446869, 91842653, 9596126, 89111398, 82841979, 28563545,
      90960358, 21785144, 2356994, 95727991, 20932152, 58996430, 40473581, 96235275,
      40044918, 48092532, 42940404, 2134346, 41006930, 89312388, 22624373, 21593977,
      44178886, 75043725, 47025270, 65622692, 64500000, 65458948, 96300057, 55821894,
      40695128, 3370104, 38538445, 43543777, 44364207, 38975369, 14878871, 65240384,
      67159705, 43586926, 48148828, 45894482, 7183277, 95503687, 26202165, 77084837,
      23265594, 2420921, 16226786, 9126351, 78349103, 9156135, 21502796, 56840658,
      45452224, 12538374, 34471458, 76263644, 91998119, 10248389, 99724761, 2111707,
      25119460, 99414168, 64631466, 25862681, 7391448, 50321796, 70583986, 29071332,
      66403530, 68005187, 87910978, 80168720, 17655904, 69279219, 77565204, 16762927,
      24294108, 16227556, 90502999, 96316857, 12923641, 59237154, 45247637, 47355498,
      71645242, 94634433, 15800838, 37580756, 81210420, 29389368, 80604091, 9995766,
      68540058, 40172183, 13955608
    ];
    const errataIds = window.errataIds || [
      130000007, 130000052, 130000080, 130000022, 130000060, 130000028, 130000110,
      130000061, 130000043, 130000081, 130000062, 130000104, 130000075, 130000011,
      130000044, 130000082, 130000105, 130000018, 130000019, 130000021, 130000002,
      130000053, 130000039, 130000026, 130000008, 130000005, 130000031, 130000009,
      130000038, 130000016, 130000030, 130000090, 130000014, 130000083, 130000071,
      130000099, 130000100, 130000106, 130000101, 130000088, 130000033, 130000000,
      130000017, 130000024, 130000025, 130000020, 130000046, 130000064, 130000086,
      130000059, 130000072, 130000079, 130000010, 130000029, 130000045, 130000023,
      130000076, 130000036, 130000001, 130000040, 130000032, 130000065, 130000051,
      130000089, 130000027, 130000041, 130000015, 130000013, 130000096, 130000078,
      130000097, 130000091, 130000092, 130000074, 130000095, 130000003, 130000048,
      130000047, 130000058, 130000012, 130000057, 130000037, 130000049, 130000055,
      130000068, 130000035, 130000050, 130000067, 130000069, 130000077, 130000084,
      130000102, 130000103, 130000108, 130000034, 130000004, 130000006, 130000042,
      130000054, 130000070, 130000085, 130000093, 130000056, 130000063, 130000087,
      130000094, 130000113
    ];

    Editor.updateDeck();// User adding a card after page load, then clicking toggle does not update Deck object

    // Get Deck object from page
    const Deck = window.Deck;
    if (!Deck) return;

    // Helper: find matches in a deck section
    function findMatches(deckArr, ids) {
      const map = {};
      deckArr.forEach((id, idx) => {
        const foundIdx = ids.indexOf(id);
        if (foundIdx !== -1) map[idx] = foundIdx;
      });
      return map;
    }

    // Try errataIds first
    let foundType = null;
    let mainMap = findMatches(Deck.main, errataIds);
    let extraMap = findMatches(Deck.extra, errataIds);
    let sideMap = findMatches(Deck.side, errataIds);

    if (Object.keys(mainMap).length || Object.keys(extraMap).length || Object.keys(sideMap).length) {
      foundType = 'errata';
    } else {
      // Try normalIds
      mainMap = findMatches(Deck.main, normalIds);
      extraMap = findMatches(Deck.extra, normalIds);
      sideMap = findMatches(Deck.side, normalIds);
      if (Object.keys(mainMap).length || Object.keys(extraMap).length || Object.keys(sideMap).length) {
        foundType = 'normal';
      }
    }

    if (!foundType) return; // Nothing to do

    // Swap logic
    const toIds = foundType === 'errata' ? normalIds : errataIds;

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
    Editor.updateDeck();
  });

  menu.appendChild(btn);
})();