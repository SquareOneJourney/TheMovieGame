/**
 * Fuzzy string matching utilities for movie title guessing
 */

/**
 * Normalizes a string for comparison by:
 * - Converting to lowercase
 * - Removing punctuation and special characters
 * - Normalizing spaces
 * - Removing common articles (a, an, the)
 * - Removing subtitles and part numbers
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .replace(/\b(a|an|the)\b/g, '') // Remove articles
    .replace(/\s+/g, ' ') // Normalize spaces again
    .trim()
}

/**
 * Creates multiple variations of a movie title for better matching
 * Handles subtitles, part numbers, colons, and common variations
 */
export function createMovieVariations(title: string): string[] {
  const variations = new Set<string>()
  
  // Add original normalized version
  variations.add(normalizeString(title))
  
  // Remove subtitles (everything after colon or dash)
  const withoutSubtitle = title.split(/[:-]/)[0].trim()
  if (withoutSubtitle !== title) {
    variations.add(normalizeString(withoutSubtitle))
  }
  
  // Remove part numbers and roman numerals
  const withoutParts = title
    .replace(/\s+(part\s+[ivx\d]+|chapter\s+[ivx\d]+|vol\.?\s*[ivx\d]+)\s*$/i, '')
    .replace(/\s+(i{1,3}|iv|v|vi{0,3}|ix|x)\s*$/i, '')
    .trim()
  
  if (withoutParts !== title) {
    variations.add(normalizeString(withoutParts))
  }
  
  // Remove "The" prefix variations
  const withoutThe = title.replace(/^the\s+/i, '').trim()
  if (withoutThe !== title) {
    variations.add(normalizeString(withoutThe))
  }
  
  // Create abbreviation variations for long titles
  const words = title.split(/\s+/)
  if (words.length > 3) {
    // First 2-3 words
    const shortVersion = words.slice(0, 2).join(' ')
    variations.add(normalizeString(shortVersion))
    
    // First 3 words if more than 2
    if (words.length > 2) {
      const mediumVersion = words.slice(0, 3).join(' ')
      variations.add(normalizeString(mediumVersion))
    }
  }
  
  return Array.from(variations)
}

/**
 * Calculates the Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Calculates similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)
  return maxLength === 0 ? 100 : ((maxLength - distance) / maxLength) * 100
}

/**
 * Checks if two movie titles match using fuzzy logic
 * @param guess - The user's guess
 * @param correctAnswer - The correct movie title
 * @param threshold - Similarity threshold (0-100), default 75
 * @returns Object with match result and details
 */
export function fuzzyMatchMovie(guess: string, correctAnswer: string, threshold: number = 75): {
  isMatch: boolean
  similarity: number
  normalizedGuess: string
  normalizedCorrect: string
  confidence: 'exact' | 'high' | 'medium' | 'low' | 'none'
} {
  const normalizedGuess = normalizeString(guess)
  const normalizedCorrect = normalizeString(correctAnswer)
  
  // Exact match after normalization
  if (normalizedGuess === normalizedCorrect) {
    return {
      isMatch: true,
      similarity: 100,
      normalizedGuess,
      normalizedCorrect,
      confidence: 'exact'
    }
  }
  
  // Calculate similarity
  const similarity = calculateSimilarity(normalizedGuess, normalizedCorrect)
  
  // Check if it meets the threshold
  const isMatch = similarity >= threshold
  
  // Determine confidence level
  let confidence: 'exact' | 'high' | 'medium' | 'low' | 'none'
  if (similarity >= 95) confidence = 'exact'
  else if (similarity >= 85) confidence = 'high'
  else if (similarity >= 75) confidence = 'medium'
  else if (similarity >= 60) confidence = 'low'
  else confidence = 'none'
  
  return {
    isMatch,
    similarity,
    normalizedGuess,
    normalizedCorrect,
    confidence
  }
}

/**
 * Common movie title variations and abbreviations
 */
const COMMON_VARIATIONS: Record<string, string[]> = {
  'youve got mail': ['you have got mail', 'you\'ve got mail'],
  'the matrix': ['matrix'],
  'titanic': ['titanic 1997'],
  'avengers endgame': ['avengers end game', 'avengers: endgame'],
  'pirates of the caribbean': ['pirates of caribbean', 'pirates caribbean'],
  'indiana jones and the last crusade': ['indiana jones last crusade', 'indiana jones 3'],
  'the devil wears prada': ['devil wears prada'],
  'the shawshank redemption': ['shawshank redemption'],
  'the silence of the lambs': ['silence of the lambs'],
  'eyes wide shut': ['eyes wide shut 1999'],
  'fight club': ['fight club 1999'],
  'the hunger games': ['hunger games']
}

/**
 * Enhanced fuzzy matching that checks multiple title variations
 */
export function enhancedFuzzyMatch(guess: string, correctAnswer: string, threshold: number = 75): {
  isMatch: boolean
  similarity: number
  normalizedGuess: string
  normalizedCorrect: string
  confidence: 'exact' | 'high' | 'medium' | 'low' | 'none'
  matchedVariation?: string
} {
  const normalizedGuess = normalizeString(guess)
  
  // First try direct fuzzy matching
  let result = fuzzyMatchMovie(guess, correctAnswer, threshold)
  
  // If no match, try all variations of the correct answer
  if (!result.isMatch) {
    const variations = createMovieVariations(correctAnswer)
    
    for (const variation of variations) {
      const variationResult = fuzzyMatchMovie(guess, variation, threshold)
      if (variationResult.isMatch) {
        return {
          ...variationResult,
          matchedVariation: variation
        }
      }
    }
    
    // Also check against common variations
    const commonVariations = COMMON_VARIATIONS[normalizeString(correctAnswer)] || []
    for (const variation of commonVariations) {
      const variationResult = fuzzyMatchMovie(guess, variation, threshold)
      if (variationResult.isMatch) {
        return {
          ...variationResult,
          matchedVariation: variation
        }
      }
    }
  }
  
  return result
}

/**
 * Test function to validate fuzzy matching with various inputs
 */
export function testFuzzyMatching() {
  const testCases = [
    { guess: 'youve got mail', correct: "You've Got Mail", expected: true },
    { guess: 'you have got mail', correct: "You've Got Mail", expected: true },
    { guess: 'matrix', correct: 'The Matrix', expected: true },
    { guess: 'titanic 1997', correct: 'Titanic', expected: true },
    { guess: 'avengers end game', correct: 'Avengers: Endgame', expected: true },
    { guess: 'pirates caribbean', correct: 'Pirates of the Caribbean', expected: true },
    { guess: 'shawshank', correct: 'The Shawshank Redemption', expected: true },
    { guess: 'mission impossible', correct: 'Mission: Impossible - Dead Reckoning Part One', expected: true },
    { guess: 'mission impossible dead reckoning', correct: 'Mission: Impossible - Dead Reckoning Part One', expected: true },
    { guess: 'mission impossible dead reckoning part two', correct: 'Mission: Impossible - Dead Reckoning Part One', expected: true },
    { guess: 'fast x', correct: 'Fast X', expected: true },
    { guess: 'fast and furious', correct: 'Fast X', expected: true },
    { guess: 'harry potter', correct: 'Harry Potter and the Chamber of Secrets', expected: true },
    { guess: 'harry potter chamber', correct: 'Harry Potter and the Chamber of Secrets', expected: true },
    { guess: 'completely wrong', correct: 'The Matrix', expected: false },
    { guess: 'matrx', correct: 'The Matrix', expected: true }, // typo
    { guess: 'the matrx', correct: 'The Matrix', expected: true }, // typo with article
  ]
  
  console.log('🧪 Testing Fuzzy Matching:')
  testCases.forEach(({ guess, correct, expected }, index) => {
    const result = enhancedFuzzyMatch(guess, correct)
    const status = result.isMatch === expected ? '✅' : '❌'
    console.log(`${status} Test ${index + 1}: "${guess}" vs "${correct}" -> ${result.isMatch} (${result.similarity.toFixed(1)}%)`)
  })
}
