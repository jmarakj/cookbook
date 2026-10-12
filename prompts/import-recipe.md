You convert a recipe from a web page into JSON for my cookbook app.

**Input:** the recipe URL at the end of this prompt. Open it and read the whole recipe. If you can't open the page, say so and stop; don't make up a recipe.

## Output

Reply with exactly three parts, in this order:

1. **File name:** a short slug for the recipe, lowercase ASCII with hyphens and no diacritics (e.g. `langose`, `kuraci-paprikas`). I'll save the recipe as `recipes/<slug>.json`.
2. **Recipe JSON** in one ```json code block, following the schema below.
3. **New enum entries** in one ```json code block: the categories, units and ingredients the recipe uses that aren't in the enums list below. Use the same shape as the enums: `{ "categories": [...], "units": [...], "ingredients": [...] }`. Leave out empty arrays. If nothing is new, write `{}`.

Don't add anything else besides one short line listing any assumptions you made.

## Recipe schema

```json
{
  "id": "<slug>",
  "name": "Name of the dish, in Slovak",
  "category": ["<category id>"],
  "cuisine": "<country code>",
  "yield": 4,
  "times": { "prep": 30, "cook": 30, "rest": 120, "total": 180 },
  "ingredients": [
    { "id": "<ingredient id>", "amount": 500, "unit": "g", "notes": "short not if needed, preferably null" }
  ],
  "steps": ["what to do."],
  "notes": "tips from the author, or null"
}
```

Rules:

- **Language:** all text (name, notes, steps, new labels) is in **Slovak** with correct diacritics. Translate if the source is in another language.
- **id:** the same as the file-name slug.
- **category:** all ids that fit, in the order of the categories list below. Use the existing categories whenever one fits; add a new one only when none fits.
  - Always add exactly one of `sweet` (any sweet dish, including sweet main dishes, desserts and cakes), `vegetarian` (savory, no meat, fish or meat broth) or `meat`.
- **cuisine:** the lowercase ISO 3166 country code of the country the dish comes from (e.g. `sk`, `it`, `fr`), not where the source website is from. It is used for search and is not in the enums.
- **yield:** the number of servings, as an integer. If the source gives pieces instead (e.g. "8 langoše"), estimate servings and mention it in your assumptions line.
- **times:** whole minutes. `prep` is hands-on work, `cook` is baking, frying or cooking, `rest` is rising, cooling or marinating. `total` = prep + cook + rest. If the source doesn't give a time, do not fill it.
- **ingredients:**
  - `id`: **reuse an existing ingredient id if it's the same ingredient**, even when the source names it differently. Otherwise create a new id: English, snake_case, general before specific (e.g. `flour_plain`, `yeast_fresh`, `oil_cooking`). Its `label` is the Slovak name in lowercase.
  - `amount`: a number (`0.5`, not `"1/2"`), or `null` when the source gives no amount (e.g. "oil for frying").
  - `unit`: one of the unit ids, or `null` when `amount` is null. For countable items use `pcs`. Convert cups, ounces, pounds and °F to metric (`g` / `ml`, °C). Keep `tsp` and `tbsp`.
  - `notes`: a short lowercase Slovak note such as type, temperature or "1/2 kocky", or `null`. Don't repeat the ingredient label (not "cibuľa" for `onion`). Put "podľa chuti" here instead of a unit when there's no amount.
  - Keep the source's order. Include optional and garnish ingredients, marked in `notes` (e.g. "voliteľné").
  - Each ingredient id appears only once. If the source lists one twice (e.g. sugar for the dough and for the topping), add up the amounts and explain the split in `notes`.
- **steps:** 4–10 steps. Write them in the imperative, short but complete, and keep all temperatures and times. Leave out stories, ads and serving fluff.
- **numbers in text:** ranges with an en dash (`15–20 minút`), a space before `°C` (`180 °C`), "približne" instead of "cca".
- **notes:** important tips or warnings from the author in 1–2 sentences, otherwise `null`.
- The JSON must be valid: double quotes, no comments, no trailing commas, `null` instead of empty strings.

## Example (existing recipe)

```json
{
  "id": "langose",
  "name": "Langoše",
  "category": ["vegetarian", "fried"],
  "cuisine": "hu",
  "yield": 4,
  "times": { "prep": 30, "cook": 30, "rest": 120, "total": 180 },
  "ingredients": [
    { "id": "flour_plain", "amount": 500, "unit": "g", "notes": "špeciál na kysnuté cesto / T650" },
    { "id": "milk", "amount": 250, "unit": "ml", "notes": "vlažné" },
    { "id": "yeast_fresh", "amount": 21, "unit": "g", "notes": "1/2 kocky" },
    { "id": "salt", "amount": 2, "unit": "tsp", "notes": null },
    { "id": "oil_cooking", "amount": null, "unit": null, "notes": "na vyprážanie" }
  ],
  "steps": [
    "Vo vlažnom mlieku rozmiešajte cukor a rozdrobené droždie. Nechajte 15 minút napeniť.",
    "Vyprážajte v hlbokom horúcom oleji (170–180 °C) približne 2 minúty z jednej strany, otočte a dopražte 50–60 sekúnd."
  ],
  "notes": "Nikdy nepoužívajte múku na podsypávanie počas tvarovania, iba olej."
}
```

## Existing enums

These are the ids you can use. Reuse them before creating new ones. https://github.com/jmarakj/cookbook/blob/main/public/enums.json