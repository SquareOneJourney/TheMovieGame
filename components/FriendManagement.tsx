'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, Users, UserCheck, UserX, X, Check, Clock, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: string
  name: string
  email: string
  score: number
  createdAt: string
}

interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: string
  createdAt: string
  sender?: User
  receiver?: User
}

interface Friend extends User {
  friendshipId: string
  friendsSince: string
}

interface GameInvite {
  id: string
  senderId: string
  receiverId: string
  gameId: string
  status: string
  createdAt: string
  sender?: User
  receiver?: User
  game?: {
    id: string
    status: string
    createdAt: string
    players: Array<{ id: string; name: string }>
  }
}

export default function FriendManagement() {
  const [activeTab, setActiveTab] = useState<'search' | 'friends' | 'requests' | 'invites'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [gameInvites, setGameInvites] = useState<GameInvite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search for users
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.success) {
        setSearchResults(data.users)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  // Send friend request
  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId })
      })

      const data = await response.json()

      if (data.success) {
        // Remove from search results
        setSearchResults(prev => prev.filter(user => user.id !== userId))
        alert('Friend request sent!')
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to send friend request')
    }
  }

  // Accept friend request
  const acceptFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      })

      const data = await response.json()

      if (data.success) {
        // Remove from requests and add to friends
        setFriendRequests(prev => prev.filter(req => req.id !== requestId))
        fetchFriends()
        alert('Friend request accepted!')
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to accept friend request')
    }
  }

  // Decline friend request
  const declineFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' })
      })

      const data = await response.json()

      if (data.success) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId))
        alert('Friend request declined')
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to decline friend request')
    }
  }

  // Remove friend
  const removeFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return

    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      })

      const data = await response.json()

      if (data.success) {
        setFriends(prev => prev.filter(friend => friend.id !== friendId))
        alert('Friend removed')
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to remove friend')
    }
  }

  // Accept game invite
  const acceptGameInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/games/invites/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      })

      const data = await response.json()

      if (data.success) {
        setGameInvites(prev => prev.filter(invite => invite.id !== inviteId))
        alert('Game invite accepted! Redirecting to game...')
        window.location.href = `/game/${data.gameId}`
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to accept game invite')
    }
  }

  // Decline game invite
  const declineGameInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/games/invites/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' })
      })

      const data = await response.json()

      if (data.success) {
        setGameInvites(prev => prev.filter(invite => invite.id !== inviteId))
        alert('Game invite declined')
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to decline game invite')
    }
  }

  // Fetch friends
  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      const data = await response.json()

      if (data.success) {
        setFriends(data.friends)
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err)
    }
  }

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests?type=received')
      const data = await response.json()

      if (data.success) {
        setFriendRequests(data.friendRequests)
      }
    } catch (err) {
      console.error('Failed to fetch friend requests:', err)
    }
  }

  // Fetch game invites
  const fetchGameInvites = async () => {
    try {
      const response = await fetch('/api/games/invites?type=received')
      const data = await response.json()

      if (data.success) {
        setGameInvites(data.gameInvites)
      }
    } catch (err) {
      console.error('Failed to fetch game invites:', err)
    }
  }

  // Load data when component mounts
  useEffect(() => {
    fetchFriends()
    fetchFriendRequests()
    fetchGameInvites()
  }, [])

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
        {[
          { id: 'search', label: 'Search', icon: Search },
          { id: 'friends', label: 'Friends', icon: Users },
          { id: 'requests', label: 'Requests', icon: UserPlus },
          { id: 'invites', label: 'Game Invites', icon: Mail }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {id === 'requests' && friendRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {friendRequests.length}
              </span>
            )}
            {id === 'invites' && gameInvites.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                {gameInvites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Search for friends by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 border-white/30 text-white placeholder-gray-300"
            />
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {searchResults.map((user) => (
              <Card key={user.id} className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{user.name}</h3>
                        <p className="text-gray-300 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-xs">Score: {user.score}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => sendFriendRequest(user.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Your Friends ({friends.length})</h2>
          <div className="space-y-2">
            {friends.map((friend) => (
              <Card key={friend.id} className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{friend.name}</h3>
                        <p className="text-gray-300 text-sm">{friend.email}</p>
                        <p className="text-gray-400 text-xs">
                          Score: {friend.score} • Friends since {new Date(friend.friendsSince).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => window.location.href = `/multiplayer?invite=${friend.id}`}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Invite to Game
                      </Button>
                      <Button
                        onClick={() => removeFriend(friend.id)}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Friend Requests ({friendRequests.length})</h2>
          <div className="space-y-2">
            {friendRequests.map((request) => (
              <Card key={request.id} className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{request.sender?.name}</h3>
                        <p className="text-gray-300 text-sm">{request.sender?.email}</p>
                        <p className="text-gray-400 text-xs">
                          Sent {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => acceptFriendRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => declineFriendRequest(request.id)}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Game Invites Tab */}
      {activeTab === 'invites' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Game Invites ({gameInvites.length})</h2>
          <div className="space-y-2">
            {gameInvites.map((invite) => (
              <Card key={invite.id} className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{invite.sender?.name} invited you to a game!</h3>
                        <p className="text-gray-300 text-sm">
                          Game ID: {invite.game?.id} • {invite.game?.players.length}/2 players
                        </p>
                        <p className="text-gray-400 text-xs">
                          Sent {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => acceptGameInvite(invite.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Join Game
                      </Button>
                      <Button
                        onClick={() => declineGameInvite(invite.id)}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
