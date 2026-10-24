import { Trash2 } from 'lucide-react'
import Dialog from '../../components/dialog/Dialog'
import useCodelists from '../../hooks/useCodelists'
import useRecipes from '../../hooks/useRecipes'
import { formatAmounts, type ShoppingGroup } from './groupItems'

type Props = {
  group: ShoppingGroup
  onRemove: (ids: string[]) => void
  onClose: () => void
}

function RemoveGroupDialog({ group, onRemove, onClose }: Props) {
  const codelists = useCodelists()
  const { recipes } = useRecipes()

  const recipeName = (recipeId: string | null) =>
    recipeId ? (recipes?.find((r) => r.id === recipeId)?.name ?? recipeId) : 'Pridané ručne'

  const remove = (ids: string[]) => {
    onRemove(ids)
    onClose()
  }

  return (
    <Dialog title={group.name} onClose={onClose}>
      <ul className="shopping-dialog-list">
        {group.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.amount != null && <strong>{formatAmounts([item], codelists)}</strong>}{' '}
              {recipeName(item.recipeId)}
            </span>
            <button
              type="button"
              aria-label={`Odstrániť ${recipeName(item.recipeId)}`}
              title="Odstrániť"
              onClick={() => remove([item.id])}
            >
              <Trash2 aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <div className="dialog-actions">
        <button type="button" className="danger" onClick={() => remove(group.items.map((i) => i.id))}>
          Odstrániť všetko
        </button>
      </div>
    </Dialog>
  )
}

export default RemoveGroupDialog
