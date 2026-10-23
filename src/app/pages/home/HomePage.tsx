import { Link } from 'react-router'
import { routes } from '../../services'
import './HomePage.css'

function HomePage() {
  return (
    <main>
      <title>Recepty</title>
      <ul className="home-tiles">
        <li>
          <Link to={routes.recipes.url()}>
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
            <span>Recepty</span>
          </Link>
        </li>
      </ul>
    </main>
  )
}

export default HomePage
