import { Codelist, type CodelistItem, type Codelists } from '../types';

export interface CodelistsService {
  getCodelists(): Promise<Codelists>;
  invalidate(): void;
}

const base = import.meta.env.BASE_URL;

let codelists: Promise<Codelists> | null = null;

async function loadCodelist(name: keyof Codelists): Promise<Codelist> {
  const res = await fetch(`${base}enums/${name}.json`);
  if (!res.ok) {
    throw new Error('Nepodarilo sa načítať číselníky');
  }
  const items: CodelistItem[] = await res.json();
  return new Codelist(items);
}

async function loadCodelists(): Promise<Codelists> {
  const [categories, units, groups, ingredients] = await Promise.all([
    loadCodelist('categories'),
    loadCodelist('units'),
    loadCodelist('groups'),
    loadCodelist('ingredients'),
  ]);
  return { categories, units, groups, ingredients };
}

export const codelistsService: CodelistsService = {
  // loaded once and shared by all pages; a failed load is retried next time
  getCodelists() {
    codelists ??= loadCodelists().catch((err) => {
      codelists = null;
      throw err;
    });
    return codelists;
  },

  invalidate() {
    codelists = null;
  },
};
