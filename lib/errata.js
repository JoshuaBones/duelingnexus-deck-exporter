/**
 * Converts card IDs in a deck between their normal and errata versions.
 *
 * @param {{main: number[], extra: number[], side: number[]}} deck Deck to update.
 * @param {boolean} fromErrataToNormal True to convert errata IDs to normal IDs.
 * @param {{normalIds: number[], errataIds: number[]}} errataIdSet ID pairs to use.
 * @returns The same deck object, modified in place.
 */
function toggleDeckErrata (deck, fromErrataToNormal, errataIdSet) {
    if (!deck || typeof deck !== 'object') {
        throw new TypeError('deck must be an object');
    }

    const toIds = fromErrataToNormal ? errataIdSet.normalIds : errataIdSet.errataIds;
    const fromIds = fromErrataToNormal ? errataIdSet.errataIds : errataIdSet.normalIds;
    const replacements = new Map(fromIds.map((id, index) => [id, toIds[index]]));

    for (const section of ['main', 'extra', 'side']) {
        /*if (!Array.isArray(deck[section])) {
            throw new TypeError(`deck.${section} must be an array`);
        }*/

        deck[section] = deck[section].map(id => replacements.has(id) ? replacements.get(id) : id);
    }

    return deck;
};