import { ChevronLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { routes } from '../../../services'
import './BackLink.css'

// mobile only (hidden by CSS) – installed PWAs on iOS have no browser back button
function BackLink() {
  const location = useLocation()
  const navigate = useNavigate()
  // 'default' = first entry in this tab (shared link, relaunch) – nothing to go back to
  const hasHistory = location.key !== 'default'
  return (
    <Link
      to={routes.recipes.url()}
      className="back"
      aria-label="Späť"
      title="Späť"
      onClick={(e) => {
        if (!hasHistory) return
        // real back, so the recipe list restores its filters from the URL
        e.preventDefault()
        navigate(-1)
      }}
    >
      <ChevronLeft aria-hidden="true" />
    </Link>
  )
}

export default BackLink
