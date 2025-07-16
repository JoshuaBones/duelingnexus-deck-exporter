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

// Injection is necessary because this feature is impossible without access to the page's 'Editor' variable
injectScript('errata_toggle.js');