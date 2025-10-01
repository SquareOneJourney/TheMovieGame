import { GameMovie } from './tmdb'

export interface MultipleChoiceOption {
  id: string
  title: string
  year: string
  poster?: string
  isCorrect: boolean
}

/**
 * Maps actors to their movies for efficient lookup
 */
function createActorMovieMap(allMovies: GameMovie[]): Map<string, GameMovie[]> {
  const actorMap = new Map<string, GameMovie[]>()
  
  allMovies.forEach(movie => {
    // Add actor1
    if (movie.actor1) {
      if (!actorMap.has(movie.actor1)) {
        actorMap.set(movie.actor1, [])
      }
      actorMap.get(movie.actor1)!.push(movie)
    }
    
    // Add actor2
    if (movie.actor2) {
      if (!actorMap.has(movie.actor2)) {
        actorMap.set(movie.actor2, [])
      }
      actorMap.get(movie.actor2)!.push(movie)
    }
  })
  
  return actorMap
}

/**
 * Finds movies where both actors appear together
 */
function findMoviesWithBothActors(actor1: string, actor2: string, allMovies: GameMovie[]): GameMovie[] {
  return allMovies.filter(movie => 
    ((movie.actor1 === actor1 && movie.actor2 === actor2) ||
     (movie.actor1 === actor2 && movie.actor2 === actor1)) &&
    movie.movie && 
    movie.movie.trim() !== ''
  )
}

/**
 * Generates 4 multiple choice options for a given movie with strategic difficulty
 * @param correctMovie - The correct movie to include
 * @param allMovies - Array of all available movies to choose wrong answers from
 * @returns Array of 4 options with one correct answer
 */
export function generateMultipleChoiceOptions(
  correctMovie: GameMovie,
  allMovies: GameMovie[]
): MultipleChoiceOption[] {
  // Create the correct option
  const correctOption: MultipleChoiceOption = {
    id: `correct-${correctMovie.movie}`,
    title: correctMovie.movie,
    year: correctMovie.year || 'Unknown',
    poster: correctMovie.poster,
    isCorrect: true
  }

  // Create actor movie mapping for efficient lookup
  const actorMovieMap = createActorMovieMap(allMovies)
  
  // Find movies where both actors appear together
  const moviesWithBothActors = findMoviesWithBothActors(
    correctMovie.actor1, 
    correctMovie.actor2, 
    allMovies
  )
  
  // Filter out the correct movie
  const otherMoviesWithBothActors = moviesWithBothActors.filter(
    movie => movie.movie !== correctMovie.movie
  )

  let wrongOptions: MultipleChoiceOption[] = []

  // Rule 1: If both actors have only starred in one movie together (the correct one)
  if (moviesWithBothActors.length === 1) {
    // 2 choices must start with Actor 1, 2 with Actor 2
    const actor1Movies = actorMovieMap.get(correctMovie.actor1) || []
    const actor2Movies = actorMovieMap.get(correctMovie.actor2) || []
    
    // Filter out the correct movie and get other movies for each actor
    const otherActor1Movies = actor1Movies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      movie.movie && 
      movie.movie.trim() !== ''
    )
    const otherActor2Movies = actor2Movies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      movie.movie && 
      movie.movie.trim() !== ''
    )
    
    // Select 2 movies from Actor 1's filmography
    const selectedActor1Movies = otherActor1Movies.slice(0, 2)
    
    // Select 2 movies from Actor 2's filmography
    const selectedActor2Movies = otherActor2Movies.slice(0, 2)
    
    // If we don't have enough movies from each actor, fill with random movies
    const allOtherMovies = allMovies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      movie.movie && 
      movie.movie.trim() !== ''
    )
    
    // Fill remaining slots if needed
    while (selectedActor1Movies.length < 2 && allOtherMovies.length > 0) {
      const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)]
      if (!selectedActor1Movies.some(m => m.movie === randomMovie.movie)) {
        selectedActor1Movies.push(randomMovie)
      }
    }
    
    while (selectedActor2Movies.length < 2 && allOtherMovies.length > 0) {
      const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)]
      if (!selectedActor1Movies.some(m => m.movie === randomMovie.movie) && 
          !selectedActor2Movies.some(m => m.movie === randomMovie.movie)) {
        selectedActor2Movies.push(randomMovie)
      }
    }
    
    // Create wrong options from selected movies
    wrongOptions = [
      ...selectedActor1Movies.slice(0, 2),
      ...selectedActor2Movies.slice(0, 2)
    ].map((movie, index) => ({
      id: `wrong-${index}`,
      title: movie.movie,
      year: movie.year || 'Unknown',
      poster: movie.poster,
      isCorrect: false
    }))
  }
  // Rule 2: If both actors star in multiple movies together
  else if (moviesWithBothActors.length > 1) {
    // 2 choices should be those 2 movies, plus 1 more movie Actor 1 has starred in, and 1 movie actor 2 has starred in
    const actor1Movies = actorMovieMap.get(correctMovie.actor1) || []
    const actor2Movies = actorMovieMap.get(correctMovie.actor2) || []
    
    // Get other movies with both actors (excluding the correct one)
    const otherMoviesWithBothActors = moviesWithBothActors.filter(
      movie => movie.movie !== correctMovie.movie
    )
    
    // Get other movies for each actor (excluding movies with both actors)
    const otherActor1Movies = actor1Movies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      !moviesWithBothActors.some(m => m.movie === movie.movie) &&
      movie.movie && 
      movie.movie.trim() !== ''
    )
    const otherActor2Movies = actor2Movies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      !moviesWithBothActors.some(m => m.movie === movie.movie) &&
      movie.movie && 
      movie.movie.trim() !== ''
    )
    
    // Select 2 movies where both actors appear together
    const selectedBothActorsMovies = otherMoviesWithBothActors.slice(0, 2)
    
    // Select 1 movie from Actor 1's other filmography
    const selectedActor1Movie = otherActor1Movies.length > 0 ? [otherActor1Movies[0]] : []
    
    // Select 1 movie from Actor 2's other filmography
    const selectedActor2Movie = otherActor2Movies.length > 0 ? [otherActor2Movies[0]] : []
    
    // If we don't have enough movies, fill with random movies
    const allOtherMovies = allMovies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      movie.movie && 
      movie.movie.trim() !== ''
    )
    
    // Fill remaining slots if needed
    while (selectedBothActorsMovies.length < 2 && allOtherMovies.length > 0) {
      const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)]
      if (!selectedBothActorsMovies.some(m => m.movie === randomMovie.movie)) {
        selectedBothActorsMovies.push(randomMovie)
      }
    }
    
    while (selectedActor1Movie.length < 1 && allOtherMovies.length > 0) {
      const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)]
      if (!selectedBothActorsMovies.some(m => m.movie === randomMovie.movie) && 
          !selectedActor1Movie.some(m => m.movie === randomMovie.movie)) {
        selectedActor1Movie.push(randomMovie)
      }
    }
    
    while (selectedActor2Movie.length < 1 && allOtherMovies.length > 0) {
      const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)]
      if (!selectedBothActorsMovies.some(m => m.movie === randomMovie.movie) && 
          !selectedActor1Movie.some(m => m.movie === randomMovie.movie) &&
          !selectedActor2Movie.some(m => m.movie === randomMovie.movie)) {
        selectedActor2Movie.push(randomMovie)
      }
    }
    
    // Create wrong options from selected movies
    wrongOptions = [
      ...selectedBothActorsMovies.slice(0, 2),
      ...selectedActor1Movie.slice(0, 1),
      ...selectedActor2Movie.slice(0, 1)
    ].map((movie, index) => ({
      id: `wrong-${index}`,
      title: movie.movie,
      year: movie.year || 'Unknown',
      poster: movie.poster,
      isCorrect: false
    }))
  }
  // Fallback: If we can't determine the relationship, use the old logic
  else {
    const wrongMovies = allMovies.filter(movie => 
      movie.movie !== correctMovie.movie &&
      movie.movie && 
      movie.movie.trim() !== ''
    )
    
    // Try to find movies from similar years for more realistic wrong answers
    const correctYear = parseInt(correctMovie.year || '2000')
    const yearRange = 5 // Within 5 years
    
    const similarYearMovies = wrongMovies.filter(movie => {
      const movieYear = parseInt(movie.year || '2000')
      return Math.abs(movieYear - correctYear) <= yearRange
    })
    
    // Select wrong options - prefer similar years, fallback to random
    let selectedWrongMovies: GameMovie[]
    if (similarYearMovies.length >= 3) {
      selectedWrongMovies = similarYearMovies.slice(0, 3)
    } else {
      // Mix similar year movies with random ones
      const randomMovies = wrongMovies.filter(movie => 
        !similarYearMovies.includes(movie)
      )
      const needed = 3 - similarYearMovies.length
      selectedWrongMovies = [
        ...similarYearMovies,
        ...randomMovies.slice(0, needed)
      ]
    }
    
    wrongOptions = selectedWrongMovies.map((movie, index) => ({
      id: `wrong-${index}`,
      title: movie.movie,
      year: movie.year || 'Unknown',
      poster: movie.poster,
      isCorrect: false
    }))
  }

  // Ensure we have exactly 3 wrong options
  while (wrongOptions.length < 3) {
    const allOtherMovies = allMovies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      movie.movie && 
      movie.movie.trim() !== '' &&
      !wrongOptions.some(option => option.title === movie.movie)
    )
    
    if (allOtherMovies.length > 0) {
      const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)]
      wrongOptions.push({
        id: `wrong-${wrongOptions.length}`,
        title: randomMovie.movie,
        year: randomMovie.year || 'Unknown',
        poster: randomMovie.poster,
        isCorrect: false
      })
    } else {
      // Fallback to generic options if no more movies available
      const genericOptions = [
        { id: 'generic-1', title: 'The Matrix', year: '1999', poster: undefined, isCorrect: false },
        { id: 'generic-2', title: 'Inception', year: '2010', poster: undefined, isCorrect: false },
        { id: 'generic-3', title: 'Avatar', year: '2009', poster: undefined, isCorrect: false }
      ]
      wrongOptions.push(genericOptions[wrongOptions.length])
    }
  }

  // Take only the first 3 wrong options
  wrongOptions = wrongOptions.slice(0, 3)

  // Combine correct and wrong options, then shuffle
  const allOptions = [correctOption, ...wrongOptions]
  return shuffleArray(allOptions)
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Validates if a selected option is correct
 */
export function validateMultipleChoiceSelection(
  selectedOption: MultipleChoiceOption,
  correctMovie: GameMovie
): boolean {
  return selectedOption.isCorrect && selectedOption.title === correctMovie.movie
}
