'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Trash2, ArrowLeft, Home, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface AdminMovie {
  id: string
  title: string
  year: string
  poster: string
  actor1: string
  actor2: string
  hintActor: string
  actor1Photo: string
  actor2Photo: string
  hintActorPhoto: string
}

export default function AdminPage() {
  const [movies, setMovies] = useState<AdminMovie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    try {
      const response = await fetch('/api/admin/movies')
      if (response.ok) {
        const data = await response.json()
        setMovies(data.movies || [])
      }
    } catch (error) {
      console.error('Error loading movies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMovie = async () => {
    if (!searchQuery.trim()) return

    setIsAdding(true)
    try {
      const response = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMovies(prev => [...prev, data.movie])
          setSearchQuery('')
        } else {
          alert(`Error: ${data.error}`)
        }
      } else {
        alert('Failed to add movie')
      }
    } catch (error) {
      console.error('Error adding movie:', error)
      alert('Failed to add movie')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return

    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMovies(prev => prev.filter(movie => movie.id !== movieId))
      } else {
        alert('Failed to delete movie')
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert('Failed to delete movie')
    }
  }

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image 
              src="/TheMovieGame Logo.png" 
              alt="The Movie Game" 
              width={120}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white rounded-full px-4 py-2"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Add Movie Section */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Plus className="h-6 w-6" />
              <span>Add New Movie</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                type="text"
                placeholder="Search for a movie title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMovie()}
                className="flex-1 bg-white/20 border-white/30 text-white placeholder-gray-300 focus:ring-blue-400"
              />
              <Button
                onClick={handleAddMovie}
                disabled={!searchQuery.trim() || isAdding}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAdding ? 'Adding...' : 'Add Movie'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Movies List */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              Movie Database ({movies.length} movies)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Loading movies...</p>
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">No movies found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-4">
                      {movie.poster && (
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          width={60}
                          height={90}
                          className="w-15 h-22 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg truncate">
                          {movie.title}
                        </h3>
                        <p className="text-gray-300 text-sm">{movie.year}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-400 text-xs">
                            <strong>Actor 1:</strong> {movie.actor1}
                          </p>
                          <p className="text-gray-400 text-xs">
                            <strong>Actor 2:</strong> {movie.actor2}
                          </p>
                          {movie.hintActor && (
                            <p className="text-gray-400 text-xs">
                              <strong>Hint:</strong> {movie.hintActor}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteMovie(movie.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
