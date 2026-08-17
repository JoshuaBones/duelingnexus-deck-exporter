import json
from pathlib import Path

ERRATA_FILE = Path("./errata_cards.txt")
CARDS_FILE = Path("./cards_en.json")
MAPPING_FILE = Path("./errata_mapping.txt")
JS_FILE = Path("./errata_ids.js")


# --------------------------------------------------
# Load errata cards
# --------------------------------------------------

errata_cards = []

with ERRATA_FILE.open("r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()

        if not line:
            continue

        errata_id, name = line.split("|", 1)

        errata_cards.append({
            "id": errata_id,
            "name": name
        })

print(f"Loaded {len(errata_cards)} errata cards.")


# --------------------------------------------------
# Load cards_en.json
# --------------------------------------------------

print(f"Loading {CARDS_FILE}...")

with CARDS_FILE.open("r", encoding="utf-8") as f:
    data = json.load(f)

cards = data["texts"]

print(f"Loaded {len(cards)} cards from cards_en.json.")


# --------------------------------------------------
# Find normal IDs
# --------------------------------------------------

mappings = []
unmatched = []

for errata in errata_cards:
    errata_id = errata["id"]
    name = errata["name"]

    normal_id = None

    # Preserve cards_en.json order.
    # Take the first card with the same name
    # but a different ID.
    for card in cards:
        card_id = str(card["id"])
        card_name = card["n"]

        if card_name == name and card_id != errata_id:
            normal_id = card_id
            break

    if normal_id:
        mappings.append(
            f"{errata_id}|{normal_id}|{name}"
        )
    else:
        unmatched.append(
            f"{errata_id}|{name}"
        )


# --------------------------------------------------
# Write mapping file
# --------------------------------------------------

MAPPING_FILE.write_text(
    "\n".join(mappings) + ("\n" if mappings else ""),
    encoding="utf-8"
)

print(f"Wrote {len(mappings)} mappings to {MAPPING_FILE}")


# --------------------------------------------------
# Write ERRATA_IDS JavaScript
# --------------------------------------------------

normal_ids = [line.split("|", 2)[1] for line in mappings]
errata_ids = [line.split("|", 2)[0] for line in mappings]

js = """const ERRATA_IDS = {
    normalIds: [
"""

js += "".join(
    f'        {card_id},\n'
    for card_id in normal_ids
)

js += """    ],
    errataIds: [
"""

js += "".join(
    f'        {card_id},\n'
    for card_id in errata_ids
)

js += """    ]
};
"""

JS_FILE.write_text(js, encoding="utf-8")

print(f"Wrote {len(mappings)} IDs to {JS_FILE}")


# --------------------------------------------------
# Report unmatched cards
# --------------------------------------------------

if unmatched:
    print()
    print(f"WARNING: {len(unmatched)} errata cards had no match:")

    for card in unmatched:
        print(f"  {card}")
else:
    print("All errata cards were matched.")