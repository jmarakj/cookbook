import { House } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { routes } from '../../services'
import './PageHeader.css'

type Props = { title?: ReactNode; left?: ReactNode; right?: ReactNode }

function PageHeader({ title, left, right }: Props) {
  return (
    <header className="page-header">
      <div className="page-header-left">
        <Link to={routes.home.url()} className="page-header-home" aria-label="Domov" title="Domov">
          <House aria-hidden="true" />
        </Link>
        {left}
      </div>
      {title && <h1>{title}</h1>}
      <div className="page-header-right">{right}</div>
    </header>
  )
}

export default PageHeader
