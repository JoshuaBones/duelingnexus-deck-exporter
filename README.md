# Dueling Nexus Deck Exporter
Chrome/Firefox extension for https://DuelingNexus.com<br /><br />
Export your deck as ydk, import/export as YDKe link, download all your decks as a zip file and more!<br />The old exporter no longer works, so this was made in its place.<br />
Feel free to suggest new features.<br /><br />
Chrome: https://chromewebstore.google.com/detail/dueling-nexus-deck-export/pjgponfjenccmekfflegcaflngfbokde<br />
Firefox: https://addons.mozilla.org/en-CA/firefox/addon/dueling-nexus-deck-exporter/<br /><br />

## Features

### Export
* Export to ydk file
* Export as ydke link to your clipboard
* Export all decks to a zip with individual ydk files
  * Optionally replace custom erratas
  * Optionally replace alt-arts with their default counterpart

### Import
* Paste YDKe link after clicking deck area to overwrite the current deck

### Editor Improvements
* Errata toggle
* Replace alt-arts for Edison mode and compatibility with other simulators

## Feature Images
![DeckEditFeatures](images/deck_edit_features.png)
![DeckListFeatures](images/deck_list_features.png)


## Injected Scripts
This extension requires some injected scripts to access local JavaScript variables (Editor, Engine, Deck)
None of these scripts transmit data and are only run locally on your machine

### Why injection is needed
Any feature that makes changes to the deck require one or more of the variables listed above
* Toggling Errata
* Replacing alt-arts
* YDKe pasting

### What scripts are injected
For a complete list of injected scripts, please see "web_accessible_resources" in manifest.json and the injectScript() calls in content.js.


## Licensing

This project is licensed under the GNU GENERAL PUBLIC LICENSE (GPL). See the `LICENSE` file for more information.

This project also uses the `YDKe.js` library, which was converted from TypeScript and is licensed under the GNU LESSER GENERAL PUBLIC LICENSE (LGPL). See the [lib/YDKe.js.license](cci:7://file:///c:/repo/duelingnexus-deck-exporter/lib/YDKe.js.license:0:0-0:0) file for more information.


