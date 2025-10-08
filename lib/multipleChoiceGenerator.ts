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
 * Generates 4 multiple choice options for a given movie with sophisticated logic
 * Based on actor relationships and filmography analysis
 * @param correctMovie - The correct movie to include
 * @param allMovies - Array of ALL available movies to choose wrong answers from
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
  
  console.log(`🎯 Multiple Choice Logic for: ${correctMovie.movie}`);
  console.log(`🎯 Actor 1: ${correctMovie.actor1}, Actor 2: ${correctMovie.actor2}`);
  console.log(`🎯 Movies with both actors: ${moviesWithBothActors.length}`);

  let wrongOptions: MultipleChoiceOption[] = []

  // IMPLEMENT YOUR SOPHISTICATED LOGIC:
  // Option 1: Correct Answer (always included)
  // Option 2: IF(Number of films they both star in<2,"One film Actor 1 stars in","Another movie the 2 actors star in but is not the correct answer")
  // Option 3: IF(Number of films they both star in<2,"One film Actor 2 stars in",IF(Number of films they both star in<3,"One film Actor 1 stars in","Another movie the 2 actors star in but is not the correct answer"))
  // Option 4: IF(Number of films they both star in<3,"One film Actor 2 stars in",IF(Number of films they both star in<4,"One film Actor 1 stars in","Another movie the 2 actors star in but is not the correct answer"))

  const bothActorsCount = moviesWithBothActors.length;
  const otherMoviesWithBothActors = moviesWithBothActors.filter(movie => movie.movie !== correctMovie.movie);
  
  // Get individual actor filmographies
  const actor1Movies = (actorMovieMap.get(correctMovie.actor1) || []).filter(movie => 
    movie.movie !== correctMovie.movie && 
    movie.movie && 
    movie.movie.trim() !== ''
  );
  const actor2Movies = (actorMovieMap.get(correctMovie.actor2) || []).filter(movie => 
    movie.movie !== correctMovie.movie && 
    movie.movie && 
    movie.movie.trim() !== ''
  );

  // Option 2 Logic
  let option2Movie: GameMovie | null = null;
  if (bothActorsCount < 2) {
    // "One film Actor 1 stars in"
    option2Movie = actor1Movies[0] || null;
  } else {
    // "Another movie the 2 actors star in but is not the correct answer"
    option2Movie = otherMoviesWithBothActors[0] || null;
  }

  // Option 3 Logic
  let option3Movie: GameMovie | null = null;
  if (bothActorsCount < 2) {
    // "One film Actor 2 stars in"
    option3Movie = actor2Movies[0] || null;
  } else if (bothActorsCount < 3) {
    // "One film Actor 1 stars in"
    option3Movie = actor1Movies[0] || null;
  } else {
    // "Another movie the 2 actors star in but is not the correct answer"
    option3Movie = otherMoviesWithBothActors[1] || otherMoviesWithBothActors[0] || null;
  }

  // Option 4 Logic
  let option4Movie: GameMovie | null = null;
  if (bothActorsCount < 3) {
    // "One film Actor 2 stars in"
    option4Movie = actor2Movies[0] || null;
  } else if (bothActorsCount < 4) {
    // "One film Actor 1 stars in"
    option4Movie = actor1Movies[1] || actor1Movies[0] || null;
  } else {
    // "Another movie the 2 actors star in but is not the correct answer"
    option4Movie = otherMoviesWithBothActors[2] || otherMoviesWithBothActors[1] || otherMoviesWithBothActors[0] || null;
  }

  // Collect all selected movies and ensure no duplicates
  const selectedMovies: GameMovie[] = [];
  const usedMovieTitles = new Set<string>();
  
  // Add movies one by one, ensuring no duplicates
  const candidates = [option2Movie, option3Movie, option4Movie].filter(Boolean);
  
  for (const movie of candidates) {
    if (movie && !usedMovieTitles.has(movie.movie)) {
      selectedMovies.push(movie);
      usedMovieTitles.add(movie.movie);
    }
  }
  
  // If we don't have enough movies, fill with random movies from the full database
  const allOtherMovies = allMovies.filter(movie => 
    movie.movie !== correctMovie.movie && 
    movie.movie && 
    movie.movie.trim() !== '' &&
    !usedMovieTitles.has(movie.movie)
  );

  // Fill remaining slots with random movies if needed
  while (selectedMovies.length < 3 && allOtherMovies.length > 0) {
    const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)];
    if (!usedMovieTitles.has(randomMovie.movie)) {
      selectedMovies.push(randomMovie);
      usedMovieTitles.add(randomMovie.movie);
    }
  }

  // Create wrong options from selected movies
  wrongOptions = selectedMovies.slice(0, 3).map((movie, index) => ({
    id: `wrong-${index}`,
    title: movie.movie,
    year: movie.year || 'Unknown',
    poster: movie.poster,
    isCorrect: false
  }));

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

  // Final check: Ensure no duplicate movie titles in the final options
  const finalOptions = [correctOption, ...wrongOptions];
  const uniqueOptions = [];
  const usedTitles = new Set<string>();
  
  for (const option of finalOptions) {
    if (!usedTitles.has(option.title)) {
      uniqueOptions.push(option);
      usedTitles.add(option.title);
    }
  }
  
  // If we lost an option due to duplicates, add a random one
  while (uniqueOptions.length < 4) {
    const allOtherMovies = allMovies.filter(movie => 
      movie.movie !== correctMovie.movie && 
      movie.movie && 
      movie.movie.trim() !== '' &&
      !usedTitles.has(movie.movie)
    );
    
    if (allOtherMovies.length > 0) {
      const randomMovie = allOtherMovies[Math.floor(Math.random() * allOtherMovies.length)];
      uniqueOptions.push({
        id: `random-${uniqueOptions.length}`,
        title: randomMovie.movie,
        year: randomMovie.year || 'Unknown',
        poster: randomMovie.poster,
        isCorrect: false
      });
      usedTitles.add(randomMovie.movie);
    } else {
      break; // Prevent infinite loop
    }
  }
  
  // Combine correct and wrong options, then shuffle
  return shuffleArray(uniqueOptions)
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
