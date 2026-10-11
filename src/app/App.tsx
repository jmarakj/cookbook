import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from './pages/home/HomePage'
import RecipeDetailPage from './pages/recipe-detail/RecipeDetailPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detail/:id" element={<RecipeDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
