(function () {
  /**
   * Extract card ID from img background URL
   * 
   * This is also possible by accessing existing js variables, but that would
   * require injecting this script, which I'd like to avoid unless necessary.
   * @param {string} deckSelector - A CSS selector for the deck container
   * @returns {Array<string>} An array of card IDs
   */
  function extractCardIds(deckSelector) {
    const container = document.querySelector(deckSelector);
    if (!container) return [];
    const images = container.querySelectorAll('img.editor-card-small');
    return Array.from(images).map(img => {
      const match = img.style.backgroundImage.match(/\/(\d+)\.jpg/);
      return match ? match[1] : null;
    }).filter(Boolean);
  }

  
/**
 * Retrieves card IDs from the main, extra, and side deck sections from the DOM.
 * 
 * @returns {Object} An object containing arrays of card IDs for the main, extra,
 *                   and side decks.
 */
  function getDeck() {
    const main = extractCardIds('#editor-main-deck');
    const extra = extractCardIds('#editor-extra-deck');
    const side = extractCardIds('#editor-side-deck');

    return { main, extra, side };
  }

  
  /**
   * Converts a deck's (main, extra, side) arrays (strings)
   * into an object with the same structure, but with each
   * converted to a Uint32Array.
   * @param {Object} deck - An object with main, extra, and side arrays.
   * @returns {Object} An object with the same structure as the input, but with
   *                   each deck array converted to a Uint32Array.
   */
  function deckToUint32Array(deck) {
    const main = new Uint32Array(deck.main.map(id => parseInt(id)));
    const extra = new Uint32Array(deck.extra.map(id => parseInt(id)));
    const side = new Uint32Array(deck.side.map(id => parseInt(id)));
    return { main, extra, side };
  }

  function showMessage(txtMessage = 'Success!') {
    const message = document.createElement('div');
    message.innerText = txtMessage;
    message.style.position = 'fixed';
    message.style.top = '10px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = 'green';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '9999';
    document.body.appendChild(message);
    setTimeout(() => {
        document.body.removeChild(message);
    }, 1000);
  }

/**
 * Adds an "Export" button to the editor, which allows users to download the current deck
 * as a .ydk file. The button is styled and added to a specific container within the page.
 * Clicking the button triggers the download of the deck as a .ydk file.
 */
  function addExportButton() {
    if (document.getElementById('editor-export-button')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'editor-export-button';
    wrapper.style.display = 'inline-flex';
    wrapper.style.position = 'relative';

    const button = document.createElement('button');
    button.id = 'export-button';
    button.textContent = 'Export';
    button.className = 'engine-button engine-button-navbar engine-button-primary ';
    button.style.borderTopRightRadius = '0';
    button.style.borderBottomRightRadius = '0';

    button.addEventListener('click', () => {
      const deck = getDeck();

      const rawName =
        document.querySelector('#editor-deck-name-button-mobile')?.textContent?.trim() ||
        document.querySelector('.editor-deck-name')?.textContent?.trim() ||
        document.querySelector('#main-title')?.textContent?.trim() ||
        'deck';

      const filename = rawName;//rawName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
      const content = buildDeckText(deck.main, deck.extra, deck.side);
      downloadFile(filename + '.ydk', content);
    });

    // Right dropdown toggle button
    const dropdownButton = document.createElement('button');
    dropdownButton.innerHTML = '▼';
    dropdownButton.className = 'engine-button engine-button-navbar engine-button-primary';
    dropdownButton.style.borderTopLeftRadius = '0';
    dropdownButton.style.borderBottomLeftRadius = '0';
    dropdownButton.style.width = '32px';//40, 28

    const menu = document.createElement('div');
    menu.style.display = 'none';
    menu.style.position = 'absolute';
    menu.style.top = '100%';
    menu.style.right = '0';
    menu.style.background = '#2c2c2c';
    menu.style.borderRadius = '6px';
    menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    menu.style.overflow = 'hidden';
    menu.style.zIndex = '1000';

    const item = document.createElement('div');
    item.textContent = 'YDKe to clipboard';
    item.style.padding = '8px 12px';
    item.style.cursor = 'pointer';
    item.style.color = '#fff';
    item.addEventListener('mouseover', () => item.style.background = '#444');
    item.addEventListener('mouseout', () => item.style.background = '');
    item.addEventListener('click', () => {
      menu.style.display = 'none';

      // Export as YDKe to clipboard
      const deck = deckToUint32Array(getDeck());

      // Make use of external library
      const ydke = toURL(deck);

      navigator.clipboard.writeText(ydke)
        .then(() => {
          showMessage('YDKe copied to clipboard!');
        })
        .catch(err => {
          console.error('Error copying text to clipboard:', err);
        });
    });
    menu.appendChild(item);

    dropdownButton.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Hide menu when clicking outside
    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    // Assemble and insert
    wrapper.appendChild(button);
    wrapper.appendChild(dropdownButton);
    wrapper.appendChild(menu);

    document.getElementById('editor-menu-content').appendChild(wrapper);

    //document.getElementById('editor-menu-content').append(button);
    //document.body.appendChild(button);
  }

  // Run on page load to dynamically add button
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addExportButton);
  } else {
    addExportButton();
  }
})();