/**
 * Injects a script into the current tab. This is usually only necessary for scripts that need to access variables in the page's context, and not used otherwise.
 * @param {string} file - The path to the script to be injected, relative to the root of the extension.
 */
function injectScript(file) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(file);
  script.onload = function () { this.remove(); };
  (document.head || document.documentElement).appendChild(script);
}

// Injection is necessary because these features are impossible without access to the page's 'Editor', 'Engine' and 'Deck' variables.
injectScript('deck_edit_alt-art_removal.js');
injectScript('errata_toggle.js');
injectScript('deck_edit_import.js');
injectScript('lib/YDKe.js');