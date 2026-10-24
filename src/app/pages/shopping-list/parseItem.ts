import type { Codelists, ShoppingItemNew } from '../../types';
import { normalizeName } from './groupItems';

const NUMBER = String.raw`(\d+(?:[.,]\d+)?)`;
const AMOUNT_FIRST = new RegExp(String.raw`^${NUMBER}\s*(?:[x×](?=\s))?\s*(.*)$`);
const AMOUNT_LAST = new RegExp(String.raw`^(.*\S)\s+${NUMBER}\s*(\S*)$`);

function findIngredient(name: string, codelists: Codelists | null) {
  const normalized = normalizeName(name);
  return (
    codelists?.ingredients.options.find((o) =>
      [o.label, ...(o.aliases ?? [])].some((n) => normalizeName(n) === normalized),
    )?.id ?? null
  );
}

function findUnit(word: string, codelists: Codelists | null) {
  const normalized = normalizeName(word);
  return (
    codelists?.units.options.find(
      (o) => normalizeName(o.id) === normalized || normalizeName(o.label) === normalized,
    )?.id ?? null
  );
}

function parseNumber(text: string) {
  return Number(text.replace(',', '.'));
}

function withUnit(name: string, amountText: string, unit: string | null) {
  const amount = parseNumber(amountText);
  return { name, amount, unit: unit ?? (amount < 10 ? 'pcs' : null) };
}

function splitAmount(text: string, codelists: Codelists | null) {
  const amountFirst = text.match(AMOUNT_FIRST);
  if (amountFirst) {
    const [, amount, rest] = amountFirst;
    const [word, ...others] = rest.split(/\s+/);
    const unit = findUnit(word, codelists);
    const name = unit ? others.join(' ') : rest;
    if (name) {
      return withUnit(name, amount, unit);
    }
  }

  const amountLast = text.match(AMOUNT_LAST);
  if (amountLast) {
    const [, name, amount, word] = amountLast;
    const unit = findUnit(word, codelists);
    if (!word || unit) {
      return withUnit(name, amount, unit);
    }
  }

  return { name: text, amount: null, unit: null };
}

export function parseItem(text: string, codelists: Codelists | null): ShoppingItemNew {
  const { name, amount, unit } = splitAmount(text.trim(), codelists);
  return {
    ingredientId: findIngredient(name, codelists),
    name,
    amount,
    unit,
    recipeId: null,
  };
}
