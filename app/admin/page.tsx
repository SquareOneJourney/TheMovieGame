'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GameMovie } from '@/lib/tmdb'
import { Trash2, Edit2, Plus, Save, X, Film, Users, Search } from 'lucide-react'

export default function AdminDashboard() {
  const [movies, setMovies] = useState<GameMovie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<GameMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMovie, setEditingMovie] = useState<GameMovie | null>(null)
  const [originalMovieTitle, setOriginalMovieTitle] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'movies' | 'search'>('movies')
  const [searchQuery, setSearchQuery] = useState('')
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<any[]>([])
  const [tmdbLoading, setTmdbLoading] = useState(false)
  const [addingMovies, setAddingMovies] = useState<Set<number>>(new Set())
  const [editingBeforeAdd, setEditingBeforeAdd] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [actorSearchQuery, setActorSearchQuery] = useState('')
  const [actorSearchResults, setActorSearchResults] = useState<GameMovie[]>([])
  const [actorTmdbResults, setActorTmdbResults] = useState<any[]>([])
  const [actorSearchLoading, setActorSearchLoading] = useState(false)
  const [movieActors, setMovieActors] = useState<{[movieId: string]: any[]}>({})
  const [loadingActors, setLoadingActors] = useState<{[movieId: string]: boolean}>({})
  
  // Filter states
  const [yearFilter, setYearFilter] = useState('')
  const [actorFilter, setActorFilter] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'actors'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()

  // Get unique years and actors for filter dropdowns
  const uniqueYears = Array.from(new Set(movies.map(m => m.year).filter(Boolean))).sort((a, b) => parseInt(b || '0') - parseInt(a || '0'))
  const uniqueActors = Array.from(new Set([
    ...movies.map(m => m.actor1).filter(Boolean),
    ...movies.map(m => m.actor2).filter(Boolean),
    ...movies.map(m => m.hintActor).filter(Boolean)
  ])).sort()

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setYearFilter('')
    setActorFilter('')
    setSortBy('title')
    setSortOrder('asc')
  }

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        if (!response.ok) {
          if (response.status === 403) {
            router.push('/') // Redirect to home if not authorized
          } else {
            router.push('/admin/login')
          }
        }
      } catch (error) {
        router.push('/admin/login')
      }
    }
    checkAuth()
  }, [router])

  // Load movies
  useEffect(() => {
  const loadMovies = async () => {
    try {
      const response = await fetch('/api/admin/movies')
      if (response.ok) {
        const data = await response.json()
          // Handle both direct array and wrapped object responses
          const moviesArray = Array.isArray(data) ? data : data.movies || []
          setMovies(moviesArray)
          setFilteredMovies(moviesArray)
        } else {
          console.error('Failed to fetch movies:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading movies:', error)
    } finally {
        setLoading(false)
      }
    }
    loadMovies()
  }, [])

  // Filter and sort movies based on all criteria
  useEffect(() => {
    try {
      let filtered = [...(movies || [])].filter(movie => movie && typeof movie === 'object')

      // Apply search query filter
      if (searchQuery.trim()) {
        filtered = filtered.filter(movie => {
          try {
            return (movie?.movie && typeof movie.movie === 'string' && movie.movie.toLowerCase().includes(searchQuery.toLowerCase())) ||
                   (movie?.actor1 && typeof movie.actor1 === 'string' && movie.actor1.toLowerCase().includes(searchQuery.toLowerCase())) ||
                   (movie?.actor2 && typeof movie.actor2 === 'string' && movie.actor2.toLowerCase().includes(searchQuery.toLowerCase())) ||
                   (movie?.year && movie.year.includes(searchQuery))
          } catch (error) {
            console.error('Error in search filter:', error, movie)
            return false
          }
        })
      }

    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(movie => movie.year === yearFilter)
    }

    // Apply actor filter
    if (actorFilter.trim()) {
      filtered = filtered.filter(movie => {
        try {
          return (movie?.actor1 && typeof movie.actor1 === 'string' && movie.actor1.toLowerCase().includes(actorFilter.toLowerCase())) ||
                 (movie?.actor2 && typeof movie.actor2 === 'string' && movie.actor2.toLowerCase().includes(actorFilter.toLowerCase())) ||
                 (movie?.hintActor && typeof movie.hintActor === 'string' && movie.hintActor.toLowerCase().includes(actorFilter.toLowerCase()))
        } catch (error) {
          console.error('Error in actor filter:', error, movie)
          return false
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      try {
        let comparison = 0
        
        switch (sortBy) {
          case 'title':
            comparison = (a?.movie || '').localeCompare(b?.movie || '')
            break
          case 'year':
            const yearA = parseInt(a?.year || '0')
            const yearB = parseInt(b?.year || '0')
            comparison = yearA - yearB
            break
          case 'actors':
            const actorsA = `${a?.actor1 || ''} ${a?.actor2 || ''}`.toLowerCase()
            const actorsB = `${b?.actor1 || ''} ${b?.actor2 || ''}`.toLowerCase()
            comparison = actorsA.localeCompare(actorsB)
            break
        }
        
        return sortOrder === 'asc' ? comparison : -comparison
      } catch (error) {
        console.error('Error in sorting:', error, a, b)
        return 0
      }
    })

    setFilteredMovies(filtered)
    } catch (error) {
      console.error('Error in filter/sort effect:', error)
      setFilteredMovies([])
    }
  }, [searchQuery, yearFilter, actorFilter, sortBy, sortOrder, movies])

  // Search TMDB
  const searchTMDB = async () => {
    if (!tmdbSearchQuery.trim()) return
    
    setTmdbLoading(true)
    try {
      const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(tmdbSearchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setTmdbResults(data.movies || [])
        } else {
        console.error('Failed to search TMDB:', response.statusText)
      }
    } catch (error) {
      console.error('Error searching TMDB:', error)
    } finally {
      setTmdbLoading(false)
    }
  }

  // Search for movies by actor in existing database and TMDB
  const searchActorMovies = async () => {
    if (!actorSearchQuery.trim()) {
      setActorSearchResults([])
      setActorTmdbResults([])
      return
    }

    const query = (actorSearchQuery || '').toLowerCase().trim()
    
    // Search existing database
    const dbResults = movies.filter(movie => 
      (movie?.actor1 && movie.actor1.toLowerCase().includes(query)) ||
      (movie?.actor2 && movie.actor2.toLowerCase().includes(query)) ||
      (movie?.hintActor && movie.hintActor.toLowerCase().includes(query))
    )
    setActorSearchResults(dbResults)

    // Search TMDB for movies featuring this actor
    setActorSearchLoading(true)
    try {
      const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(actorSearchQuery)}&type=person`)
      if (response.ok) {
        const data = await response.json()
        // Filter to only include movies where this actor appears
        const tmdbMovies = data.movies || []
        setActorTmdbResults(tmdbMovies)
      } else {
        console.error('Failed to search TMDB for actor:', response.statusText)
        setActorTmdbResults([])
      }
    } catch (error) {
      console.error('Error searching TMDB for actor:', error)
      setActorTmdbResults([])
    } finally {
      setActorSearchLoading(false)
    }
  }

  // Clear actor search
  const clearActorSearch = () => {
    setActorSearchQuery('')
    setActorSearchResults([])
    setActorTmdbResults([])
  }

  // Fetch actors for a movie from TMDB
  const fetchMovieActors = async (movie: GameMovie) => {
    if (!movie.tmdbId) return
    
    const tmdbId = movie.tmdbId
    setLoadingActors(prev => ({ ...prev, [tmdbId]: true }))
    try {
      const response = await fetch(`/api/tmdb/movie/credits?movieId=${tmdbId}`)
      if (response.ok) {
        const data = await response.json()
        // Initialize actors with default roles based on their order
        const actorsWithRoles = data.actors.map((actor: any, index: number) => ({
          ...actor,
          role: index === 0 ? 'actor1' : index === 1 ? 'actor2' : index === 2 ? 'hint' : 'extra'
        }))
        setMovieActors(prev => ({ ...prev, [tmdbId]: actorsWithRoles }))
      } else {
        console.error('Failed to fetch actors for movie:', movie.movie)
      }
    } catch (error) {
      console.error('Error fetching actors:', error)
    } finally {
      setLoadingActors(prev => ({ ...prev, [tmdbId]: false }))
    }
  }

  // Handle drag and drop reordering
  const handleDragStart = (e: React.DragEvent, movieId: string, actorIndex: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ movieId, actorIndex }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, movieId: string, targetIndex: number) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    const { movieId: sourceMovieId, actorIndex: sourceIndex } = data

    if (sourceMovieId !== movieId) return // Only reorder within the same movie

    const actors = movieActors[movieId] || []
    const newActors = [...actors]
    const [movedActor] = newActors.splice(sourceIndex, 1)
    newActors.splice(targetIndex, 0, movedActor)

    setMovieActors(prev => ({ ...prev, [movieId]: newActors }))
  }

  // Handle actor role change from dropdown
  const handleActorRoleChange = (movieId: string, actor: any, newRole: string) => {
    const currentActors = movieActors[movieId] || []
    
    // Create a new actor list with the updated role
    const updatedActors = currentActors.map(a => {
      if (a.id === actor.id) {
        return { ...a, role: newRole }
      }
      return a
    })
    
    // Sort actors by their assigned roles
    const sortedActors = updatedActors.sort((a, b) => {
      const roleOrder = { actor1: 0, actor2: 1, actor3: 2, actor4: 3, actor5: 4, hint: 5, extra: 6 }
      return (roleOrder[a.role as keyof typeof roleOrder] || 999) - (roleOrder[b.role as keyof typeof roleOrder] || 999)
    })
    
    setMovieActors(prev => ({ ...prev, [movieId]: sortedActors }))
  }

  // Handle manual actor role change for current actors
  const handleManualActorRoleChange = (currentRole: string, newRole: string) => {
    if (!editingMovie) return

    const updatedMovie = { ...editingMovie }

    // Get current actor data
    const actor1Data = {
      name: editingMovie.actor1,
      photo: editingMovie.actor1Photo
    }
    const actor2Data = {
      name: editingMovie.actor2,
      photo: editingMovie.actor2Photo
    }
    const actor3Data = editingMovie.actor3 ? {
      name: editingMovie.actor3,
      photo: editingMovie.actor3Photo
    } : null
    const actor4Data = editingMovie.actor4 ? {
      name: editingMovie.actor4,
      photo: editingMovie.actor4Photo
    } : null
    const actor5Data = editingMovie.actor5 ? {
      name: editingMovie.actor5,
      photo: editingMovie.actor5Photo
    } : null
    const hintActorData = editingMovie.hintActor ? {
      name: editingMovie.hintActor,
      photo: editingMovie.hintActorPhoto
    } : null

    // If moving to the same role, do nothing
    if (currentRole === newRole) return

    // Helper function to swap actors
    const swapActors = (role1: string, role2: string, data1: any, data2: any) => {
      if (role1 === 'actor1') {
        updatedMovie.actor1 = data2.name
        updatedMovie.actor1Photo = data2.photo
      } else if (role1 === 'actor2') {
        updatedMovie.actor2 = data2.name
        updatedMovie.actor2Photo = data2.photo
      } else if (role1 === 'actor3') {
        updatedMovie.actor3 = data2.name
        updatedMovie.actor3Photo = data2.photo
      } else if (role1 === 'actor4') {
        updatedMovie.actor4 = data2.name
        updatedMovie.actor4Photo = data2.photo
      } else if (role1 === 'actor5') {
        updatedMovie.actor5 = data2.name
        updatedMovie.actor5Photo = data2.photo
      } else if (role1 === 'hint') {
        updatedMovie.hintActor = data2.name
        updatedMovie.hintActorPhoto = data2.photo
      }

      if (role2 === 'actor1') {
        updatedMovie.actor1 = data1.name
        updatedMovie.actor1Photo = data1.photo
      } else if (role2 === 'actor2') {
        updatedMovie.actor2 = data1.name
        updatedMovie.actor2Photo = data1.photo
      } else if (role2 === 'actor3') {
        updatedMovie.actor3 = data1.name
        updatedMovie.actor3Photo = data1.photo
      } else if (role2 === 'actor4') {
        updatedMovie.actor4 = data1.name
        updatedMovie.actor4Photo = data1.photo
      } else if (role2 === 'actor5') {
        updatedMovie.actor5 = data1.name
        updatedMovie.actor5Photo = data1.photo
      } else if (role2 === 'hint') {
        updatedMovie.hintActor = data1.name
        updatedMovie.hintActorPhoto = data1.photo
      }
    }

    // Get current actor data based on role
    let currentActorData = null
    if (currentRole === 'actor1') currentActorData = actor1Data
    else if (currentRole === 'actor2') currentActorData = actor2Data
    else if (currentRole === 'actor3') currentActorData = actor3Data
    else if (currentRole === 'actor4') currentActorData = actor4Data
    else if (currentRole === 'actor5') currentActorData = actor5Data
    else if (currentRole === 'hint') currentActorData = hintActorData

    if (!currentActorData) return

    // Get target actor data based on new role
    let targetActorData = null
    if (newRole === 'actor1') targetActorData = actor1Data
    else if (newRole === 'actor2') targetActorData = actor2Data
    else if (newRole === 'actor3') targetActorData = actor3Data
    else if (newRole === 'actor4') targetActorData = actor4Data
    else if (newRole === 'actor5') targetActorData = actor5Data
    else if (newRole === 'hint') targetActorData = hintActorData

    // Perform the swap
    swapActors(currentRole, newRole, currentActorData, targetActorData)

    setEditingMovie(updatedMovie)
  }

  // Update movie with reordered actors
  const updateMovieWithActors = (movie: GameMovie, actors: any[]) => {
    const updatedMovie = { ...movie }
    
    // Find actors by their assigned roles
    const actor1 = actors.find(a => a.role === 'actor1')
    const actor2 = actors.find(a => a.role === 'actor2')
    const hintActor = actors.find(a => a.role === 'hint')
    
    if (actor1) {
      updatedMovie.actor1 = actor1.name
      updatedMovie.actor1Photo = actor1.profile_path ? 
        `https://image.tmdb.org/t/p/w185${actor1.profile_path}` : movie.actor1Photo
    }
    
    if (actor2) {
      updatedMovie.actor2 = actor2.name
      updatedMovie.actor2Photo = actor2.profile_path ? 
        `https://image.tmdb.org/t/p/w185${actor2.profile_path}` : movie.actor2Photo
    }
    
    if (hintActor) {
      updatedMovie.hintActor = hintActor.name
      updatedMovie.hintActorPhoto = hintActor.profile_path ? 
        `https://image.tmdb.org/t/p/w185${hintActor.profile_path}` : movie.hintActorPhoto
    }

    return updatedMovie
  }

  // Check if movie already exists in database
  const isMovieInDatabase = (tmdbMovie: any) => {
    const tmdbYear = new Date(tmdbMovie.release_date).getFullYear().toString()
    return movies.some(movie => 
      movie?.movie && tmdbMovie?.title && 
      typeof movie.movie === 'string' && typeof tmdbMovie.title === 'string' &&
      movie.movie.toLowerCase() === tmdbMovie.title.toLowerCase() && 
      movie.year === tmdbYear
    )
  }

  // Find the exact movie match for deletion
  const findExactMovieMatch = (tmdbMovie: any) => {
    const tmdbYear = new Date(tmdbMovie.release_date).getFullYear().toString()
    return movies.find(movie => 
      movie?.movie && tmdbMovie?.title && 
      typeof movie.movie === 'string' && typeof tmdbMovie.title === 'string' &&
      movie.movie.toLowerCase() === tmdbMovie.title.toLowerCase() && 
      movie.year === tmdbYear
    )
  }

  // Edit movie before adding from TMDB
  const editBeforeAdd = async (tmdbMovie: any) => {
    if (isMovieInDatabase(tmdbMovie)) {
      alert('This movie is already in your database!')
      return
    }

    // Add this movie ID to the loading set
    setAddingMovies(prev => new Set(prev).add(tmdbMovie.id))
    
    try {
      const response = await fetch(`/api/tmdb/movie/${tmdbMovie.id}`)
      if (response.ok) {
        const gameMovie = await response.json()
        // Add tmdbId to the game movie
        gameMovie.tmdbId = tmdbMovie.id.toString()
        
        // Set up for editing before adding
        setEditingBeforeAdd(tmdbMovie)
        setEditingMovie(gameMovie)
        setOriginalMovieTitle(gameMovie.movie)
        setShowEditModal(true) // Show the edit modal
      } else {
        console.error('Failed to get movie details:', response.statusText)
        alert('Failed to get movie details. Please try again.')
      }
    } catch (error) {
      console.error('Error getting movie details:', error)
      alert('Error getting movie details. Please try again.')
    } finally {
      // Remove this movie ID from the loading set
      setAddingMovies(prev => {
        const newSet = new Set(prev)
        newSet.delete(tmdbMovie.id)
        return newSet
      })
    }
  }

  // Add movie from TMDB
  const addFromTMDB = async (tmdbMovie: any) => {
    if (isMovieInDatabase(tmdbMovie)) {
      alert('This movie is already in your database!')
      return
    }

    // Add this movie ID to the loading set
    setAddingMovies(prev => new Set(prev).add(tmdbMovie.id))
    
    try {
      const response = await fetch(`/api/tmdb/movie/${tmdbMovie.id}`)
      if (response.ok) {
        const gameMovie = await response.json()
        // Add tmdbId to the game movie
        gameMovie.tmdbId = tmdbMovie.id.toString()
        await handleAdd(gameMovie)
        // Don't clear search results, just let the movie show as "Already in Database"
      } else {
        console.error('Failed to get movie details:', response.statusText)
        alert('Failed to add movie. Please try again.')
      }
    } catch (error) {
      console.error('Error adding movie from TMDB:', error)
      alert('Error adding movie. Please try again.')
    } finally {
      // Remove this movie ID from the loading set
      setAddingMovies(prev => {
        const newSet = new Set(prev)
        newSet.delete(tmdbMovie.id)
        return newSet
      })
    }
  }

  const handleEdit = (movie: GameMovie) => {
    // Ensure all string fields are not null to prevent React input errors
    const movieWithDefaults = {
      ...movie,
      year: movie.year || '',
      actor1: movie.actor1 || '',
      actor2: movie.actor2 || '',
      actor3: movie.actor3 || '',
      actor4: movie.actor4 || '',
      actor5: movie.actor5 || '',
      hintActor: movie.hintActor || '',
      actor1Photo: movie.actor1Photo || '',
      actor2Photo: movie.actor2Photo || '',
      actor3Photo: movie.actor3Photo || '',
      actor4Photo: movie.actor4Photo || '',
      actor5Photo: movie.actor5Photo || '',
      hintActorPhoto: movie.hintActorPhoto || '',
      poster: movie.poster || ''
    }
    setEditingMovie(movieWithDefaults)
    setOriginalMovieTitle(movie.movie || '')
    setShowEditModal(true) // Show the modal instead of inline editing
    
    // Fetch actors if we have a TMDB ID and haven't fetched them yet
    if (movie.tmdbId && !movieActors[movie.tmdbId]) {
      fetchMovieActors(movie)
    }
  }

  const handleSave = async () => {
    if (!editingMovie) return
    setSaving(true)
    try {
      // Check if this is an "edit before add" scenario
      if (editingBeforeAdd) {
        // This is a new movie being added after editing
        // Update movie with reordered actors if available
        let finalMovie = editingMovie
        if (editingMovie.tmdbId && movieActors[editingMovie.tmdbId]) {
          finalMovie = updateMovieWithActors(editingMovie, movieActors[editingMovie.tmdbId])
        }

        // Add the movie to the database
        await handleAdd(finalMovie)
        
        // Clean up edit before add state
        setEditingBeforeAdd(null)
        setEditingMovie(null)
        setOriginalMovieTitle(null)
        setShowEditModal(false)
        return
      }

      // This is editing an existing movie
      if (!originalMovieTitle) {
        console.error('Original movie title not found for editing')
        setSaving(false)
        return
      }

      // Find the original movie by its original title
      const originalMovieIndex = movies.findIndex(m => m.movie === originalMovieTitle)
      if (originalMovieIndex === -1) {
        console.error('Original movie not found for editing')
        setSaving(false)
        return
      }

      // Update movie with reordered actors if available
      let finalMovie = editingMovie
      if (editingMovie.tmdbId && movieActors[editingMovie.tmdbId]) {
        finalMovie = updateMovieWithActors(editingMovie, movieActors[editingMovie.tmdbId])
      }

      console.log('Original movie:', movies[originalMovieIndex])
      console.log('Updated movie:', finalMovie)

      // Create updated movies array
      const updatedMovies = [...movies]
      updatedMovies[originalMovieIndex] = finalMovie

      console.log('Sending movies to API:', updatedMovies.length, 'movies')

      const response = await fetch('/api/admin/movies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movies: updatedMovies })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('API response:', result)
        setMovies(updatedMovies)
        setEditingMovie(null)
        setOriginalMovieTitle(null)
        console.log('Movie saved successfully to database')
        alert('Movie saved successfully!')
      } else {
        const errorText = await response.text()
        console.error('Failed to save movie:', response.status, errorText)
        alert(`Failed to save movie: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error saving movie:', error)
      alert(`Error saving movie: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (movieTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) return
    setSaving(true)
    try {
      const response = await fetch('/api/admin/movies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMovies(movies.filter(m => m.movie !== movieTitle))
        console.log('✅ Movie deleted successfully:', data.message)
      } else {
        const errorData = await response.json()
        console.error('Failed to delete movie:', errorData.error || response.statusText)
        alert(`Failed to delete movie: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert('Error deleting movie. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async (newMovie: GameMovie) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
      })
      if (response.ok) {
        const data = await response.json()
        setMovies([...movies, data.movie])
        setIsAdding(false)
      } else {
        console.error('Failed to add movie:', response.statusText)
      }
    } catch (error) {
      console.error('Error adding movie:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="mb-8 flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'movies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Film className="w-4 h-4 inline mr-2" />
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search & Add
          </button>
        </div>

        <div className="mb-8 flex justify-end">
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-5 h-5 mr-2" /> Add New Movie
          </Button>
        </div>

        {isAdding && (
          <MovieForm
            onSave={handleAdd}
            onCancel={() => setIsAdding(false)}
            initialMovie={{
              movie: '', actor1: '', actor2: '', actor3: '', actor4: '', actor5: '', 
              year: '', poster: '', hintActor: '',
              actor1Photo: '', actor2Photo: '', actor3Photo: '', actor4Photo: '', actor5Photo: '', hintActorPhoto: ''
            }}
            isNew={true}
            saving={saving}
          />
        )}

        {/* Movies Tab - List View */}
        {activeTab === 'movies' && (
          <div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Movies List ({filteredMovies.length})</h2>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search movies, actors, or year..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-1 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
          </div>
          
                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Years</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Actor Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actor</label>
                    <select
                      value={actorFilter}
                      onChange={(e) => setActorFilter(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Actors</option>
                      {uniqueActors.map(actor => (
                        <option key={actor} value={actor}>{actor}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'title' | 'year' | 'actors')}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="title">Title</option>
                      <option value="year">Year</option>
                      <option value="actors">Actors</option>
                    </select>
          </div>
          
                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <div className="flex space-x-2">
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="asc">
                          {sortBy === 'year' ? 'Old-New' : 'A-Z'}
                        </option>
                        <option value="desc">
                          {sortBy === 'year' ? 'New-Old' : 'Z-A'}
                        </option>
                      </select>
                      <button
                        onClick={clearFilters}
                        className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Poster
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Movie Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actors
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(filteredMovies) && filteredMovies.length > 0 ? filteredMovies.map((movie, index) => (
                      <React.Fragment key={movie.movie || `movie-${index}`}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {movie.poster ? (
                              <Image 
                                src={movie.poster} 
                                alt={movie.movie}
                                width={60}
                                height={90}
                                className="w-15 h-22 object-cover rounded"
                              />
                            ) : (
                              <div className="w-15 h-22 bg-gray-200 rounded flex items-center justify-center">
                                <Film className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{movie.movie}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{movie.year || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 space-y-1">
                              <div className="flex items-center space-x-2">
                                {movie.actor1Photo && (
                                  <Image 
                                    src={movie.actor1Photo} 
                                    alt={movie.actor1}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium">{movie.actor1}</span>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Actor 1</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                {movie.actor2Photo && (
                                  <Image 
                                    src={movie.actor2Photo} 
                                    alt={movie.actor2}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium">{movie.actor2}</span>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Actor 2</span>
                              </div>
                              {movie.hintActor && (
                                <div className="flex items-center space-x-2 text-gray-500">
                                  {movie.hintActorPhoto && (
                                    <Image 
                                      src={movie.hintActorPhoto} 
                                      alt={movie.hintActor}
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  )}
                                  <span className="font-medium">{movie.hintActor}</span>
                                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Hint</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
              <Button
                                onClick={() => handleEdit(movie)} 
                variant="outline"
                size="sm"
              >
                                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
                              <Button 
                                onClick={() => movie.movie && handleDelete(movie.movie)} 
                                variant="destructive" 
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
          </div>
                          </td>
                        </tr>
                        
                        {/* Inline Edit Form - Disabled, using modal instead */}
                        {false && editingMovie?.movie === movie.movie && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-blue-50">
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-blue-800">Edit Movie: {movie.movie}</h4>
                                
                                {/* Actor Reordering Section */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-md font-medium text-gray-700">Assign actor roles:</h5>
                                    {movie.tmdbId && loadingActors[parseInt(movie.tmdbId || '0', 10)] && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Loading actors...</span>
        </div>
                                    )}
      </div>
                                  
                                  {/* Help text for movies with missing actors */}
                                  {(!movie.actor3 || !movie.actor4 || !movie.actor5) && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                      <div className="flex items-start space-x-2">
                                        <div className="text-yellow-600">💡</div>
                                        <div className="text-sm text-yellow-800">
                                          <p className="font-medium">Missing actors detected</p>
                                          <p>This movie was added before the 5-actor update. To get all 5 actors, you can:</p>
                                          <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>Manually add actors using the form fields below</li>
                                            <li>Or re-add this movie from TMDB to get fresh actor data</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Show TMDB actors if available */}
                                  {movie.tmdbId && movieActors[movie.tmdbId!] ? (
                                    <div className="space-y-2">
                                      {movieActors[movie.tmdbId!]?.map((actor: any, index: number) => {
                                        return (
                                          <div
                                            key={actor.id}
                                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                          >
                                            <div className="flex items-center space-x-2 text-gray-400">
                                              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                                                {index + 1}
                                              </div>
                                            </div>
                                            {actor.profile_path && (
                                              <Image 
                                                src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                                                alt={actor.name}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full object-cover"
                                              />
                                            )}
                                            <div className="flex-1">
                                              <div className="font-medium text-gray-900">{actor.name}</div>
                                              <div className="text-sm text-gray-500">{actor.character}</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <select
                                                value={actor.role || 'extra'}
                                                onChange={(e) => handleActorRoleChange(movie.tmdbId!, actor, e.target.value)}
                                                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              >
                                                <option value="actor1">Actor 1</option>
                                                <option value="actor2">Actor 2</option>
                                                <option value="actor3">Actor 3</option>
                                                <option value="actor4">Actor 4</option>
                                                <option value="actor5">Actor 5</option>
                                                <option value="hint">Hint Actor</option>
                                                <option value="extra">Extra</option>
                                              </select>
                                              <div className="text-xs text-gray-400">
                                                {actor.role === 'actor1' && "🎭 Main"}
                                                {actor.role === 'actor2' && "🎭 Main"}
                                                {actor.role === 'actor3' && "🎭 Main"}
                                                {actor.role === 'actor4' && "🎭 Main"}
                                                {actor.role === 'actor5' && "🎭 Main"}
                                                {actor.role === 'hint' && "💡 Hint"}
                                                {actor.role === 'extra' && "👥 Extra"}
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    /* Show current actors as editable fields */
                                    <div className="space-y-2">
                                      <div className="text-sm text-gray-600 mb-3">
                                        {movie.tmdbId ? 'No TMDB actor data available' : 'No TMDB ID - edit actors manually below'}
                                      </div>
                                      
                                      {/* Actor 1 */}
                                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center space-x-2 text-blue-600">
                                          <div className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center text-xs font-medium">
                                            1
                                          </div>
                                        </div>
                                        {editingMovie.actor1Photo && (
                                          <Image 
                                            src={editingMovie.actor1Photo} 
                                            alt={editingMovie.actor1}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900">{editingMovie.actor1}</div>
                                          <div className="text-sm text-gray-500">Actor 1</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <select
                                            value="actor1"
                                            onChange={(e) => handleManualActorRoleChange('actor1', e.target.value)}
                                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="actor1">Actor 1</option>
                                            <option value="actor2">Actor 2</option>
                                            <option value="actor3">Actor 3</option>
                                            <option value="actor4">Actor 4</option>
                                            <option value="actor5">Actor 5</option>
                                            <option value="hint">Hint Actor</option>
                                          </select>
                                          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                            🎭 Main
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Actor 2 */}
                                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-2 text-green-600">
                                          <div className="w-6 h-6 bg-green-200 rounded flex items-center justify-center text-xs font-medium">
                                            2
                                          </div>
                                        </div>
                                        {editingMovie.actor2Photo && (
                                          <Image 
                                            src={editingMovie.actor2Photo} 
                                            alt={editingMovie.actor2}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900">{editingMovie.actor2}</div>
                                          <div className="text-sm text-gray-500">Actor 2</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <select
                                            value="actor2"
                                            onChange={(e) => handleManualActorRoleChange('actor2', e.target.value)}
                                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="actor1">Actor 1</option>
                                            <option value="actor2">Actor 2</option>
                                            <option value="actor3">Actor 3</option>
                                            <option value="actor4">Actor 4</option>
                                            <option value="actor5">Actor 5</option>
                                            <option value="hint">Hint Actor</option>
                                          </select>
                                          <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            🎭 Main
          </div>
        </div>
      </div>

                                      {/* Hint Actor */}
                                      {editingMovie.hintActor && (
                                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                          <div className="flex items-center space-x-2 text-purple-600">
                                            <div className="w-6 h-6 bg-purple-200 rounded flex items-center justify-center text-xs font-medium">
                                              3
                                            </div>
                                          </div>
                                          {editingMovie.hintActorPhoto && (
                                            <Image 
                                              src={editingMovie.hintActorPhoto} 
                                              alt={editingMovie.hintActor}
                                              width={40}
                                              height={40}
                                              className="w-10 h-10 rounded-full object-cover"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">{editingMovie.hintActor}</div>
                                            <div className="text-sm text-gray-500">Hint Actor</div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <select
                                              value="hint"
                                              onChange={(e) => handleManualActorRoleChange('hint', e.target.value)}
                                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="actor1">Actor 1</option>
                                              <option value="actor2">Actor 2</option>
                                              <option value="actor3">Actor 3</option>
                                              <option value="actor4">Actor 4</option>
                                              <option value="actor5">Actor 5</option>
                                              <option value="hint">Hint Actor</option>
                                            </select>
                                            <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                              💡 Hint
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Actor 3 */}
                                      {(editingMovie.actor3 || editingMovie.actor3 === null) && (
                                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                          <div className="flex items-center space-x-2 text-orange-600">
                                            <div className="w-6 h-6 bg-orange-200 rounded flex items-center justify-center text-xs font-medium">
                                              4
                                            </div>
                                          </div>
                                          {editingMovie.actor3Photo && (
                                            <Image 
                                              src={editingMovie.actor3Photo} 
                                              alt={editingMovie.actor3}
                                              width={40}
                                              height={40}
                                              className="w-10 h-10 rounded-full object-cover"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">{editingMovie.actor3 || 'No actor'}</div>
                                            <div className="text-sm text-gray-500">Actor 3</div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <select
                                              value="actor3"
                                              onChange={(e) => handleManualActorRoleChange('actor3', e.target.value)}
                                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="actor1">Actor 1</option>
                                              <option value="actor2">Actor 2</option>
                                              <option value="actor3">Actor 3</option>
                                              <option value="actor4">Actor 4</option>
                                              <option value="actor5">Actor 5</option>
                                              <option value="hint">Hint Actor</option>
                                            </select>
                                            <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                              🎭 Main
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Actor 4 */}
                                      {(editingMovie.actor4 || editingMovie.actor4 === null) && (
                                        <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                                          <div className="flex items-center space-x-2 text-teal-600">
                                            <div className="w-6 h-6 bg-teal-200 rounded flex items-center justify-center text-xs font-medium">
                                              5
                                            </div>
                                          </div>
                                          {editingMovie.actor4Photo && (
                                            <Image 
                                              src={editingMovie.actor4Photo} 
                                              alt={editingMovie.actor4}
                                              width={40}
                                              height={40}
                                              className="w-10 h-10 rounded-full object-cover"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">{editingMovie.actor4 || 'No actor'}</div>
                                            <div className="text-sm text-gray-500">Actor 4</div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <select
                                              value="actor4"
                                              onChange={(e) => handleManualActorRoleChange('actor4', e.target.value)}
                                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="actor1">Actor 1</option>
                                              <option value="actor2">Actor 2</option>
                                              <option value="actor3">Actor 3</option>
                                              <option value="actor4">Actor 4</option>
                                              <option value="actor5">Actor 5</option>
                                              <option value="hint">Hint Actor</option>
                                            </select>
                                            <div className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                                              🎭 Main
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Actor 5 */}
                                      {(editingMovie.actor5 || editingMovie.actor5 === null) && (
                                        <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                                          <div className="flex items-center space-x-2 text-pink-600">
                                            <div className="w-6 h-6 bg-pink-200 rounded flex items-center justify-center text-xs font-medium">
                                              6
                                            </div>
                                          </div>
                                          {editingMovie.actor5Photo && (
                                            <Image 
                                              src={editingMovie.actor5Photo} 
                                              alt={editingMovie.actor5}
                                              width={40}
                                              height={40}
                                              className="w-10 h-10 rounded-full object-cover"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">{editingMovie.actor5 || 'No actor'}</div>
                                            <div className="text-sm text-gray-500">Actor 5</div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <select
                                              value="actor5"
                                              onChange={(e) => handleManualActorRoleChange('actor5', e.target.value)}
                                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="actor1">Actor 1</option>
                                              <option value="actor2">Actor 2</option>
                                              <option value="actor3">Actor 3</option>
                                              <option value="actor4">Actor 4</option>
                                              <option value="actor5">Actor 5</option>
                                              <option value="hint">Hint Actor</option>
                                            </select>
                                            <div className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                                              🎭 Main
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Traditional Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormInput label="Movie Title" name="movie" value={editingMovie.movie} onChange={(e) => setEditingMovie(prev => prev ? {...prev, movie: e.target.value} : null)} required />
                                  <FormInput label="Year" name="year" value={editingMovie.year || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, year: e.target.value} : null)} />
                                  <FormInput label="Actor 1 Name" name="actor1" value={editingMovie.actor1 || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor1: e.target.value} : null)} required />
                                  <FormInput label="Actor 1 Photo URL" name="actor1Photo" value={editingMovie.actor1Photo || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor1Photo: e.target.value} : null)} />
                                  <FormInput label="Actor 2 Name" name="actor2" value={editingMovie.actor2 || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor2: e.target.value} : null)} required />
                                  <FormInput label="Actor 2 Photo URL" name="actor2Photo" value={editingMovie.actor2Photo || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor2Photo: e.target.value} : null)} />
                                  <FormInput label="Actor 3 Name" name="actor3" value={editingMovie.actor3 || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor3: e.target.value} : null)} />
                                  <FormInput label="Actor 3 Photo URL" name="actor3Photo" value={editingMovie.actor3Photo || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor3Photo: e.target.value} : null)} />
                                  <FormInput label="Actor 4 Name" name="actor4" value={editingMovie.actor4 || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor4: e.target.value} : null)} />
                                  <FormInput label="Actor 4 Photo URL" name="actor4Photo" value={editingMovie.actor4Photo || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor4Photo: e.target.value} : null)} />
                                  <FormInput label="Actor 5 Name" name="actor5" value={editingMovie.actor5 || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor5: e.target.value} : null)} />
                                  <FormInput label="Actor 5 Photo URL" name="actor5Photo" value={editingMovie.actor5Photo || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, actor5Photo: e.target.value} : null)} />
                                  <FormInput label="Hint Actor Name" name="hintActor" value={editingMovie.hintActor || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, hintActor: e.target.value} : null)} />
                                  <FormInput label="Hint Actor Photo URL" name="hintActorPhoto" value={editingMovie.hintActorPhoto || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, hintActorPhoto: e.target.value} : null)} />
                                  <FormInput label="Poster URL" name="poster" value={editingMovie.poster || ''} onChange={(e) => setEditingMovie(prev => prev ? {...prev, poster: e.target.value} : null)} />
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                      setEditingMovie(null)
                                      setOriginalMovieTitle(null)
                                      setEditingBeforeAdd(null)
                                      setShowEditModal(false)
                                    }} 
                                    disabled={saving}
                                  >
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                  </Button>
              <Button
                                    onClick={handleSave} 
                                    className="bg-green-600 hover:bg-green-700 text-white" 
                                    disabled={saving}
                                  >
                                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p className="text-gray-500 text-lg">No movies found. Add some movies to get started!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
              </div>
        )}


        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Actor Search Section */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Search Movies by Actor</h2>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Search for an actor (e.g., Robin Williams)..."
                  value={actorSearchQuery}
                  onChange={(e) => setActorSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchActorMovies()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  onClick={searchActorMovies} 
                  disabled={actorSearchLoading || !actorSearchQuery.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actorSearchLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
                {actorSearchQuery && (
                  <Button 
                    onClick={clearActorSearch}
                    variant="outline"
                    className="text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {(actorSearchResults.length > 0 || actorTmdbResults.length > 0) && (
                <div className="space-y-6">
                  {/* Database Results */}
                  {actorSearchResults.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-700">
                        In Your Database ({actorSearchResults.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {actorSearchResults.map((movie, index) => (
                          <Card key={movie.movie || `search-movie-${index}`} className="p-4 hover:shadow-lg transition-shadow bg-green-50 border-green-200">
                            <div className="flex space-x-3">
                      {movie.poster && (
                        <Image
                          src={movie.poster}
                                  alt={movie.movie}
                          width={60}
                          height={90}
                          className="w-15 h-22 object-cover rounded"
                        />
                      )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-gray-800">{movie.movie}</h4>
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                                    In Database
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{movie.year}</p>
                        <div className="mt-2 space-y-1">
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium">Actor 1:</span> {movie.actor1}
                          </p>
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium">Actor 2:</span> {movie.actor2}
                          </p>
                          {movie.hintActor && (
                                    <p className="text-xs text-gray-500">
                                      <span className="font-medium">Hint Actor:</span> {movie.hintActor}
                            </p>
                          )}
                        </div>
                                <div className="mt-3 flex space-x-2">
                      <Button
                                    onClick={() => handleEdit(movie)} 
                        variant="outline"
                        size="sm"
                                    className="flex-1"
                                  >
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                  </Button>
                                  <Button 
                                    onClick={() => movie.movie && handleDelete(movie.movie)} 
                                    variant="destructive" 
                                    size="sm"
                                    className="flex-1"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                              </div>
                            </div>
                          </Card>
                ))}
                      </div>
              </div>
            )}

                  {/* TMDB Results */}
                  {actorTmdbResults.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-700">
                        From TMDB ({actorTmdbResults.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {actorTmdbResults.map((movie) => {
                          const isDuplicate = isMovieInDatabase(movie)
                          const isAdding = addingMovies.has(movie.id)
                          return (
                            <Card key={movie.id} className={`p-4 hover:shadow-lg transition-shadow ${isDuplicate ? 'bg-yellow-50 border-yellow-200' : ''}`}>
                              <div className="flex space-x-3">
                                {movie.poster_path && (
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                    alt={movie.title}
                                    width={60}
                                    height={90}
                                    className="w-15 h-22 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-semibold text-gray-800">{movie.title}</h4>
                                    {isDuplicate && (
                                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                        Already Added
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{movie.overview}</p>
                                  <div className="mt-2 flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">⭐ {movie.vote_average?.toFixed(1)}</span>
                                    <span className="text-xs text-gray-500">👥 {movie.vote_count}</span>
                                  </div>
                                  {isDuplicate ? (
                                    <div className="mt-2 flex space-x-2">
                                      <Button
                                        onClick={() => addFromTMDB(movie)}
                                        disabled={isAdding}
                                        size="sm"
                                        className="flex-1 bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Already in Database
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          const existingMovie = findExactMovieMatch(movie)
                                          if (existingMovie) {
                                            handleDelete(existingMovie.movie)
                                          }
                                        }}
                                        disabled={isAdding}
                                        size="sm"
                                        variant="destructive"
                                        className="px-3"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="mt-2 space-y-2">
                                      <Button
                                        onClick={() => addFromTMDB(movie)}
                                        disabled={isAdding}
                                        size="sm"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        {isAdding ? (
                                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <>
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Directly
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        onClick={() => editBeforeAdd(movie)}
                                        disabled={isAdding}
                                        size="sm"
                                        variant="outline"
                                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                                      >
                                        {isAdding ? (
                                          <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <>
                                            <Edit2 className="w-3 h-3 mr-1" />
                                            Edit & Add
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
        </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {actorSearchLoading && (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Searching TMDB for movies featuring &quot;{actorSearchQuery}&quot;...</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* TMDB Search Section */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Search TMDB Database</h2>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for movies on TMDB..."
                    value={tmdbSearchQuery}
                    onChange={(e) => setTmdbSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchTMDB()}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {tmdbSearchQuery && (
                    <button
                      onClick={() => setTmdbSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button 
                  onClick={searchTMDB} 
                  disabled={tmdbLoading || !tmdbSearchQuery.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {tmdbLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {tmdbResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-700">Search Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tmdbResults.map((movie) => {
                      const isDuplicate = isMovieInDatabase(movie)
                      const isAdding = addingMovies.has(movie.id)
                      return (
                        <Card key={movie.id} className={`p-4 hover:shadow-lg transition-shadow ${isDuplicate ? 'bg-yellow-50 border-yellow-200' : ''}`}>
                          <div className="flex space-x-3">
                            {movie.poster_path && (
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                alt={movie.title}
                                width={60}
                                height={90}
                                className="w-15 h-22 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-gray-800">{movie.title}</h4>
                                {isDuplicate && (
                                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                    Already Added
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{movie.overview}</p>
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-xs text-gray-500">⭐ {movie.vote_average?.toFixed(1)}</span>
                                <span className="text-xs text-gray-500">👥 {movie.vote_count}</span>
                              </div>
                              {isDuplicate ? (
                                <div className="mt-2 flex space-x-2">
                                  <Button
                                    onClick={() => addFromTMDB(movie)}
                                    disabled={isAdding}
                                    size="sm"
                                    className="flex-1 bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Already in Database
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const existingMovie = findExactMovieMatch(movie)
                                      if (existingMovie) {
                                        handleDelete(existingMovie.movie)
                                      }
                                    }}
                                    disabled={isAdding}
                                    size="sm"
                                    variant="destructive"
                                    className="px-3"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="mt-2 space-y-2">
                                  <Button
                                    onClick={() => addFromTMDB(movie)}
                                    disabled={isAdding}
                                    size="sm"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {isAdding ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Directly
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => editBeforeAdd(movie)}
                                    disabled={isAdding}
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                                  >
                                    {isAdding ? (
                                      <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <Edit2 className="w-3 h-3 mr-1" />
                                        Edit & Add
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
              </div>
            )}
        </Card>
          </div>
        )}
      </div>

      {/* Edit Before Add Modal */}
      {showEditModal && editingMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBeforeAdd ? `Edit Movie Before Adding: ${editingMovie.movie}` : `Edit Movie: ${editingMovie.movie}`}
                </h2>
                <button
                  onClick={() => {
                    setEditingMovie(null)
                    setOriginalMovieTitle(null)
                    setEditingBeforeAdd(null)
                    setShowEditModal(false)
                  }}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Movie Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Movie Title</label>
                    <input
                      type="text"
                      value={editingMovie.movie || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, movie: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="text"
                      value={editingMovie.year || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Actor Reordering Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-700">Organize Actors:</h3>
                      <p className="text-sm text-gray-500">Reorder positions and select which actor should be the hint</p>
                    </div>
                    {editingMovie.tmdbId && loadingActors[editingMovie.tmdbId] && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span>Loading actors...</span>
                      </div>
                    )}
                  </div>

                  {/* Simplified Actor Display - Just 5 actors with hint selection */}
                  <div className="space-y-3">
                    {/* Actor 1 */}
                    {editingMovie.actor1 && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-600">
                          <div className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center text-xs font-medium">1</div>
                        </div>
                        {editingMovie.actor1Photo && (
                          <Image 
                            src={editingMovie.actor1Photo} 
                            alt={editingMovie.actor1}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{editingMovie.actor1}</div>
                          <div className="text-sm text-gray-500">Actor 1</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value="actor1"
                            onChange={(e) => handleManualActorRoleChange('actor1', e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="actor1">Position 1</option>
                            <option value="actor2">Position 2</option>
                            <option value="actor3">Position 3</option>
                            <option value="actor4">Position 4</option>
                            <option value="actor5">Position 5</option>
                          </select>
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              name="hintActor"
                              checked={editingMovie.hintActor === editingMovie.actor1}
                              onChange={() => {
                                setEditingMovie({
                                  ...editingMovie,
                                  hintActor: editingMovie.actor1,
                                  hintActorPhoto: editingMovie.actor1Photo
                                })
                              }}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-purple-600 font-medium">Hint Actor</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Actor 2 */}
                    {editingMovie.actor2 && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-6 h-6 bg-green-200 rounded flex items-center justify-center text-xs font-medium">2</div>
                        </div>
                        {editingMovie.actor2Photo && (
                          <Image 
                            src={editingMovie.actor2Photo} 
                            alt={editingMovie.actor2}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{editingMovie.actor2}</div>
                          <div className="text-sm text-gray-500">Actor 2</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value="actor2"
                            onChange={(e) => handleManualActorRoleChange('actor2', e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="actor1">Position 1</option>
                            <option value="actor2">Position 2</option>
                            <option value="actor3">Position 3</option>
                            <option value="actor4">Position 4</option>
                            <option value="actor5">Position 5</option>
                          </select>
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              name="hintActor"
                              checked={editingMovie.hintActor === editingMovie.actor2}
                              onChange={() => {
                                setEditingMovie({
                                  ...editingMovie,
                                  hintActor: editingMovie.actor2,
                                  hintActorPhoto: editingMovie.actor2Photo
                                })
                              }}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-purple-600 font-medium">Hint Actor</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Actor 3 */}
                    {editingMovie.actor3 && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <div className="w-6 h-6 bg-yellow-200 rounded flex items-center justify-center text-xs font-medium">3</div>
                        </div>
                        {editingMovie.actor3Photo && (
                          <Image 
                            src={editingMovie.actor3Photo} 
                            alt={editingMovie.actor3}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{editingMovie.actor3}</div>
                          <div className="text-sm text-gray-500">Actor 3</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value="actor3"
                            onChange={(e) => handleManualActorRoleChange('actor3', e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="actor1">Position 1</option>
                            <option value="actor2">Position 2</option>
                            <option value="actor3">Position 3</option>
                            <option value="actor4">Position 4</option>
                            <option value="actor5">Position 5</option>
                          </select>
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              name="hintActor"
                              checked={editingMovie.hintActor === editingMovie.actor3}
                              onChange={() => {
                                setEditingMovie({
                                  ...editingMovie,
                                  hintActor: editingMovie.actor3,
                                  hintActorPhoto: editingMovie.actor3Photo
                                })
                              }}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-purple-600 font-medium">Hint Actor</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Actor 4 */}
                    {editingMovie.actor4 && (
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 text-red-600">
                          <div className="w-6 h-6 bg-red-200 rounded flex items-center justify-center text-xs font-medium">4</div>
                        </div>
                        {editingMovie.actor4Photo && (
                          <Image 
                            src={editingMovie.actor4Photo} 
                            alt={editingMovie.actor4}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{editingMovie.actor4}</div>
                          <div className="text-sm text-gray-500">Actor 4</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value="actor4"
                            onChange={(e) => handleManualActorRoleChange('actor4', e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="actor1">Position 1</option>
                            <option value="actor2">Position 2</option>
                            <option value="actor3">Position 3</option>
                            <option value="actor4">Position 4</option>
                            <option value="actor5">Position 5</option>
                          </select>
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              name="hintActor"
                              checked={editingMovie.hintActor === editingMovie.actor4}
                              onChange={() => {
                                setEditingMovie({
                                  ...editingMovie,
                                  hintActor: editingMovie.actor4,
                                  hintActorPhoto: editingMovie.actor4Photo
                                })
                              }}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-purple-600 font-medium">Hint Actor</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Actor 5 */}
                    {editingMovie.actor5 && (
                      <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center space-x-2 text-indigo-600">
                          <div className="w-6 h-6 bg-indigo-200 rounded flex items-center justify-center text-xs font-medium">5</div>
                        </div>
                        {editingMovie.actor5Photo && (
                          <Image 
                            src={editingMovie.actor5Photo} 
                            alt={editingMovie.actor5}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{editingMovie.actor5}</div>
                          <div className="text-sm text-gray-500">Actor 5</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value="actor5"
                            onChange={(e) => handleManualActorRoleChange('actor5', e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="actor1">Position 1</option>
                            <option value="actor2">Position 2</option>
                            <option value="actor3">Position 3</option>
                            <option value="actor4">Position 4</option>
                            <option value="actor5">Position 5</option>
                          </select>
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              name="hintActor"
                              checked={editingMovie.hintActor === editingMovie.actor5}
                              onChange={() => {
                                setEditingMovie({
                                  ...editingMovie,
                                  hintActor: editingMovie.actor5,
                                  hintActorPhoto: editingMovie.actor5Photo
                                })
                              }}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-purple-600 font-medium">Hint Actor</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingMovie(null)
                      setOriginalMovieTitle(null)
                      setEditingBeforeAdd(null)
                      setShowEditModal(false)
                    }}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" /> {saving ? (editingBeforeAdd ? 'Adding...' : 'Saving...') : (editingBeforeAdd ? 'Add to Database' : 'Save Changes')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface MovieFormProps {
  initialMovie: GameMovie;
  onSave: (movie: GameMovie) => void;
  onCancel: () => void;
  isNew: boolean;
  saving: boolean;
}

function MovieForm({ initialMovie, onSave, onCancel, isNew, saving }: MovieFormProps) {
  const [movie, setMovie] = useState<GameMovie>(initialMovie)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMovie(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(movie)
  }

  return (
    <Card className="p-6 shadow-lg mb-6 bg-blue-50 border-blue-200">
      <h3 className="text-xl font-bold text-blue-800 mb-4">{isNew ? 'Add New Movie' : `Edit ${movie.movie}`}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Movie Title" name="movie" value={movie.movie || ''} onChange={handleChange} required />
        <FormInput label="Year" name="year" value={movie.year || ''} onChange={handleChange} />
        <FormInput label="Actor 1 Name" name="actor1" value={movie.actor1 || ''} onChange={handleChange} required />
        <FormInput label="Actor 1 Photo URL" name="actor1Photo" value={movie.actor1Photo || ''} onChange={handleChange} />
        <FormInput label="Actor 2 Name" name="actor2" value={movie.actor2 || ''} onChange={handleChange} required />
        <FormInput label="Actor 2 Photo URL" name="actor2Photo" value={movie.actor2Photo || ''} onChange={handleChange} />
        <FormInput label="Actor 3 Name" name="actor3" value={movie.actor3 || ''} onChange={handleChange} />
        <FormInput label="Actor 3 Photo URL" name="actor3Photo" value={movie.actor3Photo || ''} onChange={handleChange} />
        <FormInput label="Actor 4 Name" name="actor4" value={movie.actor4 || ''} onChange={handleChange} />
        <FormInput label="Actor 4 Photo URL" name="actor4Photo" value={movie.actor4Photo || ''} onChange={handleChange} />
        <FormInput label="Actor 5 Name" name="actor5" value={movie.actor5 || ''} onChange={handleChange} />
        <FormInput label="Actor 5 Photo URL" name="actor5Photo" value={movie.actor5Photo || ''} onChange={handleChange} />
        <FormInput label="Hint Actor Name" name="hintActor" value={movie.hintActor || ''} onChange={handleChange} />
        <FormInput label="Hint Actor Photo URL" name="hintActorPhoto" value={movie.hintActorPhoto || ''} onChange={handleChange} />
        <FormInput label="Poster URL" name="poster" value={movie.poster || ''} onChange={handleChange} />
        <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FormInput = ({ label, ...props }: FormInputProps) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);