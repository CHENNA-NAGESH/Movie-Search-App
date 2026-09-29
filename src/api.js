const WIKI_API = 'https://en.wikipedia.org/w/api.php'

function yearFrom(title, extract) {
  const fromTitle = title.match(/\((\d{4})/)
  if (fromTitle) {
    return fromTitle[1]
  }
  const fromPlot = (extract || '').match(/\b((?:19|20)\d{2})\b/)
  return fromPlot ? fromPlot[1] : 'N/A'
}

function displayTitle(title) {
  return title
    .replace(/\s*\(\d{4} film\)$/i, '')
    .replace(/\s*\([^)]*film\)$/i, '')
    .trim()
}

function mapPage(page) {
  const extract = page.extract || ''
  const year = yearFrom(page.title, extract)
  return {
    imdbID: String(page.pageid),
    wikiTitle: page.title,
    Title: displayTitle(page.title),
    Year: year,
    Type: 'movie',
    Poster: page.thumbnail?.source || '',
    Rated: 'N/A',
    Runtime: 'N/A',
    Genre: 'Film',
    Director: 'N/A',
    Released: year,
    Plot: extract || 'No plot available.',
  }
}

async function wikiQuery(searchTerm) {
  const query = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${searchTerm} film`,
    gsrlimit: '12',
    prop: 'pageimages|extracts|info',
    inprop: 'url',
    exintro: '1',
    explaintext: '1',
    exchars: '400',
    pithumbsize: '400',
    pilicense: 'any',
    format: 'json',
    origin: '*',
  })

  const response = await fetch(`${WIKI_API}?${query.toString()}`, {
    headers: {
      'Api-User-Agent': 'MovieSearchApp/1.0 (local student project)',
    },
  })

  if (response.status === 429) {
    throw new Error('Movie search is busy. Wait a few seconds and try again.')
  }
  if (!response.ok) {
    throw new Error('Unable to reach the movie database.')
  }

  return response.json()
}

export async function searchMovies(term) {
  const data = await wikiQuery(term)
  const pages = Object.values(data.query?.pages || {})
  const movies = pages
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .filter((page) => {
      const extract = page.extract || ''
      const title = page.title || ''
      if (/soundtrack|album/i.test(title)) return false
      if (/may refer to/i.test(extract)) return false
      return Boolean(extract)
    })
    .map(mapPage)

  if (!movies.length) {
    throw new Error('No movies found. Try another title.')
  }

  return { Search: movies }
}

export async function getMovieDetails(wikiTitle) {
  const query = new URLSearchParams({
    action: 'query',
    titles: wikiTitle,
    prop: 'pageimages|extracts|info',
    exintro: '1',
    explaintext: '1',
    exchars: '800',
    pithumbsize: '500',
    pilicense: 'any',
    format: 'json',
    origin: '*',
  })
  const response = await fetch(`${WIKI_API}?${query.toString()}`, {
    headers: {
      'Api-User-Agent': 'MovieSearchApp/1.0 (local student project)',
    },
  })
  if (!response.ok) {
    throw new Error('Unable to load movie details.')
  }
  const data = await response.json()
  const page = Object.values(data.query?.pages || {})[0]
  if (!page || page.missing) {
    throw new Error('Movie details were not found.')
  }
  return mapPage(page)
}
