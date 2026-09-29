import { useMemo, useState } from 'react'
import './App.css'
import { getApiKey, getMovieDetails, saveApiKey, searchMovies } from './api'

function Poster({ src, alt }) {
  if (!src || src === 'N/A') {
    return <div className="poster-fallback">No poster</div>
  }
  return <img src={src} alt={alt} />
}

export default function App() {
  const [query, setQuery] = useState('Inception')
  const [apiKey, setApiKey] = useState(getApiKey)
  const [movies, setMovies] = useState([])
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('Search for a movie to get started.')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const version = import.meta.env.VITE_APP_VERSION || 'dev'

  const hasResults = movies.length > 0
  const hint = useMemo(
    () => (apiKey ? 'Key saved in this browser.' : 'Get a free key at omdbapi.com'),
    [apiKey],
  )

  async function handleSearch(event) {
    event.preventDefault()
    const term = query.trim()
    if (!term) {
      setError('Enter a movie title.')
      return
    }

    setLoading(true)
    setError('')
    setSelected(null)
    setStatus('Searching...')

    try {
      const data = await searchMovies(term)
      setMovies(data.Search || [])
      setStatus(`${data.Search?.length || 0} results for “${term}”.`)
    } catch (err) {
      setMovies([])
      setError(err.message)
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  async function openDetails(imdbID) {
    setLoading(true)
    setError('')
    try {
      const details = await getMovieDetails(imdbID)
      setSelected(details)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function persistKey(event) {
    event.preventDefault()
    saveApiKey(apiKey)
    setError('')
    setStatus('API key saved. You can search now.')
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Cinema finder</p>
          <h1>Movie Search App</h1>
          <p className="subtitle">
            Search titles, open details, and browse posters. Built for Docker,
            Jenkins, Kubernetes, and Bitbucket Pipelines.
          </p>
        </div>
        <p className="version">build {version}</p>
      </header>

      <form className="key-row" onSubmit={persistKey}>
        <input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="OMDb API key"
          aria-label="OMDb API key"
        />
        <button type="submit">Save key</button>
      </form>
      <p className="status">{hint}</p>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies..."
          aria-label="Search movies"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : <p className="status">{status}</p>}

      {hasResults && (
        <section className="grid" aria-label="Search results">
          {movies.map((movie) => (
            <button
              className="card"
              key={movie.imdbID}
              onClick={() => openDetails(movie.imdbID)}
            >
              <Poster src={movie.Poster} alt={movie.Title} />
              <div className="card-body">
                <h2>{movie.Title}</h2>
                <p className="meta">
                  {movie.Year} · {movie.Type}
                </p>
              </div>
            </button>
          ))}
        </section>
      )}

      {selected && (
        <article className="details">
          <Poster src={selected.Poster} alt={selected.Title} />
          <div>
            <h2>
              {selected.Title} ({selected.Year})
            </h2>
            <p className="meta">
              {selected.Rated} · {selected.Runtime} · {selected.Genre}
            </p>
            <div className="chip-row">
              <span className="chip">IMDb {selected.imdbRating}</span>
              <span className="chip">{selected.Director}</span>
              <span className="chip">{selected.Released}</span>
            </div>
            <p className="plot">{selected.Plot}</p>
            <button className="close" type="button" onClick={() => setSelected(null)}>
              Close details
            </button>
          </div>
        </article>
      )}
    </main>
  )
}
