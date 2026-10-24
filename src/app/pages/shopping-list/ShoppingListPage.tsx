import { BookOpen, Check, ListX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import BackLink from '../../components/back-link/BackLink';
import Dialog from '../../components/dialog/Dialog';
import PageHeader from '../../components/page-header/PageHeader';
import useCodelists from '../../hooks/useCodelists';
import useRecipes from '../../hooks/useRecipes';
import useShoppingList from '../../hooks/useShoppingList';
import { routes } from '../../services';
import type { ShoppingItem, ShoppingItemNew } from '../../types';
import { groupItems, type ShoppingGroup } from './groupItems';
import { parseItem } from './parseItem';
import RemoveGroupDialog from './RemoveGroupDialog';
import './ShoppingListPage.css';

function ShoppingListPage() {
  const { items, error, add, setBought, remove, removeRecipe } = useShoppingList();

  if (error) {
    return <ShoppingListError message={error} />;
  }
  if (!items) {
    return <ShoppingListLoading />;
  }

  return (
    <ShoppingListView
      items={items}
      onAdd={add}
      onSetBought={setBought}
      onRemove={remove}
      onRemoveRecipe={removeRecipe}
    />
  );
}

function ShoppingListError({ message }: { message: string }) {
  return (
    <main>
      <PageHeader left={<BackLink to={routes.home.url()} />} />
      <p>{message}</p>
    </main>
  );
}

function ShoppingListLoading() {
  return (
    <main>
      <PageHeader left={<BackLink to={routes.home.url()} />} />
      Načítavam…
    </main>
  );
}

type ShoppingListViewProps = {
  items: ShoppingItem[];
  onAdd: (items: ShoppingItemNew[]) => void;
  onSetBought: (ids: string[], bought: boolean) => void;
  onRemove: (ids: string[]) => void;
  onRemoveRecipe: (recipeId: string) => void;
};

function ShoppingListView({
  items,
  onAdd,
  onSetBought,
  onRemove,
  onRemoveRecipe,
}: ShoppingListViewProps) {
  const codelists = useCodelists();
  const { recipes } = useRecipes();
  const [text, setText] = useState('');
  const [removing, setRemoving] = useState<ShoppingGroup | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [showingRecipes, setShowingRecipes] = useState(false);

  const submit = () => {
    if (!text.trim()) {
      return;
    }
    onAdd([parseItem(text, codelists)]);
    setText('');
  };

  const clearAll = () => onRemove(items.map((i) => i.id));

  const clear = () => {
    if (items.every((i) => i.bought)) {
      clearAll();
    } else {
      setConfirmingClear(true);
    }
  };

  const groups = groupItems(items, codelists);
  const recipeIds = [...new Set(items.map((i) => i.recipeId).filter((id) => id != null))];
  const recipeName = (id: string) => recipes?.find((r) => r.id === id)?.name ?? id;

  return (
    <main >
      <title>Nákupný zoznam</title>
      <PageHeader
        left={<BackLink to={routes.home.url()} />}
        right={
          <>
            {recipeIds.length > 0 && (
              <button
                type="button"
                aria-label="Recepty v zozname"
                title="Recepty v zozname"
                onClick={() => setShowingRecipes(true)}
              >
                <BookOpen aria-hidden="true" />
              </button>
            )}
            {items.length > 0 && (
              <button
                type="button"
                className="shopping-clear"
                aria-label="Vymazať celý zoznam"
                title="Vymazať celý zoznam"
                onClick={clear}
              >
                <ListX aria-hidden="true" />
              </button>
            )}
          </>
        }
      />

      <div className="shopping">
        <div className="shopping-add-bar">
          <form
            className="shopping-add"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              type="text"
              placeholder="Pridať položku…"
              aria-label="Nová položka"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {text.trim() && (
              <button type="submit" aria-label="Pridať" title="Pridať">
                <Check aria-hidden="true" />
              </button>
            )}
          </form>
        </div>

        {groups.length === 0 && <p className="shopping-empty">Zoznam je prázdny.</p>}

        <ul className="shopping-items">
          {groups.map((group, index) => {
            const ids = group.items.map((i) => i.id);
            const heading = group.bought ? 'Kúpené' : group.aisle;
            const previous = groups[index - 1];
            const previousHeading = previous && (previous.bought ? 'Kúpené' : previous.aisle);
            return [
              heading && heading !== previousHeading && (
                <li key={`heading:${heading}`} className="shopping-aisle">
                  {heading}
                </li>
              ),
              <li key={group.key} className={group.bought ? 'bought' : undefined}>
                <label>
                  <input
                    type="checkbox"
                    checked={group.bought}
                    onChange={() => onSetBought(ids, !group.bought)}
                  />
                  <span>
                    {group.amount && <strong>{group.amount}</strong>} {group.name}
                  </span>
                </label>
                <button
                  type="button"
                  aria-label={`Odstrániť ${group.name}`}
                  title="Odstrániť"
                  onClick={() => (ids.length > 1 ? setRemoving(group) : onRemove(ids))}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>,
            ];
          })}
        </ul>
      </div>

      {removing && (
        <RemoveGroupDialog group={removing} onRemove={onRemove} onClose={() => setRemoving(null)} />
      )}

      {showingRecipes && recipeIds.length > 0 && (
        <Dialog title="Recepty v zozname" onClose={() => setShowingRecipes(false)}>
          <ul className="shopping-dialog-list">
            {recipeIds.map((id) => (
              <li key={id}>
                <Link to={routes.recipe.url(id)}>{recipeName(id)}</Link>
                <button
                  type="button"
                  aria-label={`Odobrať recept ${recipeName(id)}`}
                  title="Odobrať recept"
                  onClick={() => onRemoveRecipe(id)}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </Dialog>
      )}

      {confirmingClear && (
        <Dialog title="Vymazať celý nákupný zoznam?" onClose={() => setConfirmingClear(false)}>
          <div className="dialog-actions">
            <button type="button" onClick={() => setConfirmingClear(false)}>
              Zrušiť
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => {
                clearAll();
                setConfirmingClear(false);
              }}
            >
              Vymazať
            </button>
          </div>
        </Dialog>
      )}
    </main>
  );
}

export default ShoppingListPage;
