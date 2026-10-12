export type CodelistItem = { id: string; label: string }

export class Codelist {
  readonly options: CodelistItem[]
  private readonly labels: Map<string, string>

  constructor(options: CodelistItem[]) {
    this.options = options
    this.labels = new Map(options.map((o) => [o.id, o.label]))
  }

  // falls back to the id so an unknown code still shows something
  label(id: string) {
    return this.labels.get(id) ?? id
  }

  has(id: string) {
    return this.labels.has(id)
  }
}

export type Codelists = Record<'categories' | 'units' | 'ingredients', Codelist>
