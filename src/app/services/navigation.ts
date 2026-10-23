// single source of app URLs – `path` is the pattern for <Route>, `url` builds a link
export const routes = {
  home: {
    path: '/',
    url: () => '/',
  },
  recipes: {
    path: '/recipes',
    url: () => '/recipes',
  },
  recipe: {
    path: '/recipe/:id',
    url: (id: string) => `/recipe/${encodeURIComponent(id)}`,
  },
}
