'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { GameMovie } from '@/lib/tmdb'
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react'

export default function AdminDashboard() {
  const [movies, setMovies] = useState<GameMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMovie, setEditingMovie] = useState<GameMovie | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

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
          setMovies(data.movies)
        }
      } catch (error) {
        console.error('Failed to load movies:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMovies()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/movies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movies })
      })

      if (response.ok) {
        setEditingMovie(null)
        setIsAdding(false)
      } else {
        alert('Failed to save movies')
      }
    } catch (error) {
      alert('Failed to save movies')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      const newMovies = movies.filter((_, i) => i !== index)
      setMovies(newMovies)
    }
  }

  const handleAdd = () => {
    const newMovie: GameMovie = {
      actor1: '',
      actor2: '',
      movie: '',
      year: '',
      hintActor: '',
      actor1Photo: '',
      actor2Photo: '',
      hintActorPhoto: ''
    }
    setMovies([...movies, newMovie])
    setEditingMovie(newMovie)
    setIsAdding(true)
  }

  const handleEdit = (movie: GameMovie) => {
    setEditingMovie(movie)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingMovie(null)
    setIsAdding(false)
  }

  const handleLogout = () => {
    document.cookie = 'admin-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Movie Database Admin</h1>
            <div className="flex gap-4">
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Movie
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">Total movies: {movies.length}</p>
        </div>

        <div className="grid gap-6">
          {movies.map((movie, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {movie.movie} {movie.year && `(${movie.year})`}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Actor 1</p>
                      <p className="font-medium">{movie.actor1}</p>
                      {movie.actor1Photo && (
                        <Image 
                          src={movie.actor1Photo} 
                          alt={movie.actor1}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover mt-2"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Actor 2</p>
                      <p className="font-medium">{movie.actor2}</p>
                      {movie.actor2Photo && (
                        <Image 
                          src={movie.actor2Photo} 
                          alt={movie.actor2}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover mt-2"
                        />
                      )}
                    </div>
                  </div>
                  {movie.hintActor && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Hint Actor</p>
                      <p className="font-medium">{movie.hintActor}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleEdit(movie)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(index)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No movies found</p>
            <Button onClick={handleAdd} className="mt-4">
              Add your first movie
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {isAdding ? 'Add New Movie' : 'Edit Movie'}
                </h2>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Movie Title
                    </label>
                    <Input
                      value={editingMovie.movie}
                      onChange={(e) => setEditingMovie({...editingMovie, movie: e.target.value})}
                      placeholder="Enter movie title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <Input
                      value={editingMovie.year || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, year: e.target.value})}
                      placeholder="Enter year"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actor 1
                    </label>
                    <Input
                      value={editingMovie.actor1}
                      onChange={(e) => setEditingMovie({...editingMovie, actor1: e.target.value})}
                      placeholder="Enter actor 1 name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actor 2
                    </label>
                    <Input
                      value={editingMovie.actor2}
                      onChange={(e) => setEditingMovie({...editingMovie, actor2: e.target.value})}
                      placeholder="Enter actor 2 name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actor 1 Photo URL
                    </label>
                    <Input
                      value={editingMovie.actor1Photo || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, actor1Photo: e.target.value})}
                      placeholder="Enter photo URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actor 2 Photo URL
                    </label>
                    <Input
                      value={editingMovie.actor2Photo || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, actor2Photo: e.target.value})}
                      placeholder="Enter photo URL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hint Actor
                  </label>
                  <Input
                    value={editingMovie.hintActor || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, hintActor: e.target.value})}
                    placeholder="Enter hint actor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hint Actor Photo URL
                  </label>
                  <Input
                    value={editingMovie.hintActorPhoto || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, hintActorPhoto: e.target.value})}
                    placeholder="Enter hint actor photo URL"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
