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
 * Adds an "Export" button to the editor, which allows users to download the current deck
 * as a .ydk file. The button is styled and added to a specific container within the page.
 * Clicking the button triggers the download of the deck as a .ydk file.
 */
  function addExportButton() {
    if (document.getElementById('editor-export-button')) return;

    const button = document.createElement('button');
    button.id = 'export-button';
    button.textContent = 'Export';
    button.className = 'engine-button engine-button-navbar engine-button-primary ';

    button.addEventListener('click', () => {
      const main = extractCardIds('#editor-main-deck');
      const extra = extractCardIds('#editor-extra-deck');
      const side = extractCardIds('#editor-side-deck');

      const rawName =
        document.querySelector('#editor-deck-name-button-mobile')?.textContent?.trim() ||
        document.querySelector('.editor-deck-name')?.textContent?.trim() ||
        document.querySelector('#main-title')?.textContent?.trim() ||
        'deck';

      const filename = rawName;//rawName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
      const content = buildDeckText(main, extra, side);
      downloadFile(filename + '.ydk', content);
    });

    document.getElementById('editor-menu-content').append(button);
    //document.body.appendChild(button);
  }

  // Run on page load to dynamically add button
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addExportButton);
  } else {
    addExportButton();
  }
})();