/**
 * Based on ydke.js from ProjectIgnis (https://github.com/ProjectIgnis/ydke.js)
 * Original file: https://github.com/ProjectIgnis/ydke.js/blob/master/src/index.ts
 * Changed to work with JavaScript
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * Modifications by Dueling Nexus Deck Exporter
 */


// Base64 ↔ passcode array conversion

function base64ToPasscodes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Uint32Array(bytes.buffer);
}

function passcodesToBase64(passcodes) {
    const bytes = new Uint8Array(passcodes.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Deck structure: { main: Uint32Array, extra: Uint32Array, side: Uint32Array }

function parseURL(ydke) {
    if (!ydke.startsWith("ydke://")) {
        throw new Error("Unrecognized URL protocol");
    }

    const components = ydke.substring("ydke://".length).split("!");
    if (components.length < 3) {
        throw new Error("Malformed YDKe URL");
    }

    return {
        main: base64ToPasscodes(components[0]),
        extra: base64ToPasscodes(components[1]),
        side: base64ToPasscodes(components[2]),
    };
}

function toURL(typedDeck) {
    return "ydke://" +
        passcodesToBase64(typedDeck.main) + "!" +
        passcodesToBase64(typedDeck.extra) + "!" +
        passcodesToBase64(typedDeck.side) + "!";
}

function extractURLs(from) {
  const ydkeReg = /ydke:\/\/[A-Za-z0-9+/=]*?![A-Za-z0-9+/=]*?![A-Za-z0-9+/=]*?!/g;
  const matches = [];
  let match;
  while ((match = ydkeReg.exec(from)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}