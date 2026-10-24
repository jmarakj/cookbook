import { BookOpen, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { recipesService } from '../../api';
import Image from '../../components/image/Image';
import useShoppingList from '../../hooks/useShoppingList';
import { routes } from '../../services';
import { groupItems } from '../shopping-list/groupItems';
import './HomePage.css';

function HomePage() {
  const [lastSeen] = useState(() => recipesService.getLastSeen());
  const { items } = useShoppingList();
  const unbought = items ? groupItems(items, null).filter((g) => !g.bought).length : 0;

  return (
    <main>
      <title>Recepty</title>
      <ul className="home-tiles">
        <li>
          <Link to={routes.recipes.url()}>
            <BookOpen size={64} strokeWidth={1.5} aria-hidden />
            <span>Recepty</span>
          </Link>
        </li>
        <li>
          <Link to={routes.shoppingList.url()}>
            <ShoppingCart size={64} strokeWidth={1.5} aria-hidden />
            <span>Nákupný zoznam</span>
            {unbought > 0 && (
              <span className="home-badge" title="Nekúpené položky">
                {unbought}
              </span>
            )}
          </Link>
        </li>
        {lastSeen && (
          <li>
            <Link
              to={routes.recipe.url(lastSeen.id)}
              className="recipe-tile"
              title="Naposledy pozretý recept"
            >
              <div className="recipe-tile-backdrop">
                <Image src={lastSeen.image} alt="" />
              </div>
              <span>{lastSeen.name}</span>
            </Link>
          </li>
        )}
      </ul>
    </main>
  );
}

export default HomePage;
