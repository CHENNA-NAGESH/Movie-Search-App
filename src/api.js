const OMDB_URL = 'https://www.omdbapi.com/'

export function getApiKey() {
  return (
    localStorage.getItem('omdbApiKey') ||
    import.meta.env.VITE_OMDB_API_KEY ||
    ''
  )
}

export function saveApiKey(key) {
  localStorage.setItem('omdbApiKey', key.trim())
}

async function request(params) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('Add an OMDb API key to search movies.')
  }

  const query = new URLSearchParams({ apikey: apiKey, ...params })
  const response = await fetch(`${OMDB_URL}?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Unable to reach the movie database.')
  }

  const data = await response.json()
  if (data.Response === 'False') {
    throw new Error(data.Error || 'No results found.')
  }

  return data
}

export function searchMovies(query) {
  return request({ s: query, type: 'movie' })
}

export function getMovieDetails(imdbId) {
  return request({ i: imdbId, plot: 'full' })
}
