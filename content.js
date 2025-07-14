// This file adds scripts that need to be injected
function injectScript(file) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(file);
  script.onload = function () { this.remove(); };
  (document.head || document.documentElement).appendChild(script);
}
injectScript('errata_toggle.js');