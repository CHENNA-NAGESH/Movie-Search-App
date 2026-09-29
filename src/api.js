const ITUNES_SEARCH = 'https://itunes.apple.com/search'
const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup'

function posterFromArtwork(url) {
  if (!url) return ''
  return url.replace('100x100bb', '600x600bb').replace('100x100', '600x600')
}

function runtimeFromMillis(ms) {
  if (!ms) return 'N/A'
  const minutes = Math.round(ms / 60000)
  return `${minutes} min`
}

function yearFromDate(value) {
  return value ? value.slice(0, 4) : 'N/A'
}

function mapItunesMovie(item) {
  return {
    imdbID: String(item.trackId),
    Title: item.trackName,
    Year: yearFromDate(item.releaseDate),
    Type: 'movie',
    Poster: posterFromArtwork(item.artworkUrl100),
    Rated: item.contentAdvisoryRating || 'N/A',
    Runtime: runtimeFromMillis(item.trackTimeMillis),
    Genre: item.primaryGenreName || 'N/A',
    imdbRating: item.trackExplicitness === 'explicit' ? 'Explicit' : 'N/A',
    Director: item.artistName || 'N/A',
    Released: item.releaseDate ? item.releaseDate.slice(0, 10) : 'N/A',
    Plot: item.longDescription || item.shortDescription || 'No plot available.',
  }
}

async function searchCountry(term, country) {
  const query = new URLSearchParams({
    term,
    entity: 'movie',
    media: 'movie',
    limit: '20',
    country,
  })
  const response = await fetch(`${ITUNES_SEARCH}?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Unable to reach the movie database.')
  }
  const data = await response.json()
  return (data.results || [])
    .filter((item) => item.trackId && item.trackName)
    .map(mapItunesMovie)
}

export async function searchMovies(term) {
  const countries = ['IN', 'US']
  let lastError = null

  for (const country of countries) {
    try {
      const movies = await searchCountry(term, country)
      if (movies.length) {
        return { Search: movies, country }
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    throw lastError
  }

  throw new Error('No movies found. Try another title.')
}

export async function getMovieDetails(trackId) {
  const query = new URLSearchParams({
    id: trackId,
    entity: 'movie',
    country: 'US',
  })
  const response = await fetch(`${ITUNES_LOOKUP}?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Unable to load movie details.')
  }
  const data = await response.json()
  const item = (data.results || []).find((row) => String(row.trackId) === String(trackId))
  if (!item) {
    throw new Error('Movie details were not found.')
  }
  return mapItunesMovie(item)
}
