import { BookOpen, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { getLastSeenRecipe } from '../../api'
import Image from '../../components/image/Image'
import { routes } from '../../services'
import './HomePage.css'

function HomePage() {
  const [lastSeen] = useState(getLastSeenRecipe)

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
  )
}

export default HomePage
