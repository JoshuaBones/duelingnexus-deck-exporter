(function () {
  // Extract card ID from img background URL
  function extractCardIds(deckSelector) {
    const container = document.querySelector(deckSelector);
    if (!container) return [];
    const images = container.querySelectorAll('img.editor-card-small');
    return Array.from(images).map(img => {
      const match = img.style.backgroundImage.match(/\/(\d+)\.jpg/);
      return match ? match[1] : null;
    }).filter(Boolean);
  }

  // Build the .ydk deck text
  function buildDeckText(main, extra, side) {
    const lines = ['#created by ...', '#main'];
    lines.push(...main);
    lines.push('#extra', ...extra);
    lines.push('!side', ...side);
    return lines.join('\n');
  }

  // Download the generated file
  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename.endsWith('.ydk') ? filename : filename + '.ydk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  // Add the export button immediately
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

  // Run immediately on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addExportButton);
  } else {
    addExportButton();
  }
})();
