import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import './Dialog.css'

type Props = {
  title: ReactNode
  onClose: () => void
  children: ReactNode
}

function Dialog({ title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <header>
        <h2>{title}</h2>
        <button type="button" aria-label="Zavrieť" title="Zavrieť" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </header>
      {children}
    </dialog>
  )
}

export default Dialog
