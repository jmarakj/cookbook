import { ChevronLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { routes } from '../../services';
import './BackLink.css';

type Props = { to?: string };

function BackLink({ to = routes.recipes.url() }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  // 'default' = first entry in this tab (shared link, relaunch) – nothing to go back to
  const hasHistory = location.key !== 'default';
  return (
    <Link
      to={to}
      className="back"
      aria-label="Späť"
      title="Späť"
      onClick={(e) => {
        if (!hasHistory) {
          return;
        }
        // real back, so the recipe list restores its filters from the URL
        e.preventDefault();
        navigate(-1);
      }}
    >
      <ChevronLeft aria-hidden="true" />
    </Link>
  );
}

export default BackLink;
