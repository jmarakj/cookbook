import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/home/HomePage'
import RecipeDetailPage from './pages/recipe-detail/RecipeDetailPage'
import RecipeListPage from './pages/recipe-list/RecipeListPage'
import { routes } from './services'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path={routes.home.path} element={<HomePage />} />
        <Route path={routes.recipes.path} element={<RecipeListPage />} />
        <Route path={routes.recipe.path} element={<RecipeDetailPage />} />
        {/* unknown URLs (old links, typos) -> home */}
        <Route path="*" element={<Navigate to={routes.home.url()} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
