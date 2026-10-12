import { Link, useLocation, useNavigate } from 'react-router'
import './BackLink.css'

// mobile only (hidden by CSS) – installed PWAs on iOS have no browser back button
function BackLink() {
  const location = useLocation()
  const navigate = useNavigate()
  // 'default' = first entry in this tab (shared link, relaunch) – nothing to go back to
  const hasHistory = location.key !== 'default'
  return (
    <Link
      to="/"
      className="back"
      onClick={(e) => {
        if (!hasHistory) return
        // real back, so the home page restores its filters from the URL
        e.preventDefault()
        navigate(-1)
      }}
    >
      Späť
    </Link>
  )
}

export default BackLink
