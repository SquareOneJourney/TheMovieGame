'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, Search, X, Check, XCircle, UserCheck, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface User {
  id: string
  name: string
  email: string
  relationshipStatus: 'friend' | 'pending' | 'none'
}

interface FriendRequest {
  id: string
  sender: User
  receiver: User
  status: string
  createdAt: string
}

interface GameInvite {
  id: string
  sender: User
  game: {
    id: string
    players: User[]
    rounds: Array<{
      actor1: string
      actor2: string
      movie: string
    }>
  }
  status: string
  createdAt: string
}

export default function FriendsPanel() {
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests' | 'invites'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [gameInvites, setGameInvites] = useState<GameInvite[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch friends
  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      const data = await response.json()
      if (data.success) {
        setFriends(data.friends)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests')
      const data = await response.json()
      if (data.success) {
        setFriendRequests(data.friendRequests)
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  // Fetch game invites
  const fetchGameInvites = async () => {
    try {
      const response = await fetch('/api/invites?type=received')
      const data = await response.json()
      if (data.success) {
        setGameInvites(data.gameInvites)
      }
    } catch (error) {
      console.error('Error fetching game invites:', error)
    }
  }

  // Search users
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error('Error searching users:', error)
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
        // Update search results
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, relationshipStatus: 'pending' as const }
              : user
          )
        )
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      alert('Failed to send friend request')
    }
  }

  // Accept/decline friend request
  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await response.json()
      if (data.success) {
        fetchFriendRequests()
        fetchFriends()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error processing friend request:', error)
      alert('Failed to process friend request')
    }
  }

  // Accept/decline game invite
  const handleGameInvite = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await response.json()
      if (data.success) {
        if (action === 'accept') {
          window.location.href = `/game/${data.gameInvite.game.id}`
        } else {
          fetchGameInvites()
        }
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error processing game invite:', error)
      alert('Failed to process game invite')
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchFriends()
    fetchFriendRequests()
    fetchGameInvites()
  }, [])

  // Search debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardContent className="p-6">
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'friends', label: 'Friends', icon: Users },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'requests', label: 'Requests', icon: UserPlus },
            { id: 'invites', label: 'Invites', icon: Mail }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              onClick={() => setActiveTab(id as any)}
              variant={activeTab === id ? 'default' : 'ghost'}
              size="sm"
              className="text-white"
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Your Friends</h3>
              {friends.length === 0 ? (
                <p className="text-gray-300 text-center py-4">No friends yet</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-white font-medium">{friend.name}</p>
                        <p className="text-sm text-gray-400">{friend.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-green-400" />
                        <Button
                          onClick={() => {
                            // TODO: Start a game with friend
                            alert('Start game feature coming soon!')
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Play
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Search Users</h3>
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                </div>
              ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                <p className="text-gray-300 text-center py-4">No users found</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.relationshipStatus === 'friend' && (
                          <UserCheck className="h-4 w-4 text-green-400" />
                        )}
                        {user.relationshipStatus === 'pending' && (
                          <span className="text-yellow-400 text-sm">Pending</span>
                        )}
                        {user.relationshipStatus === 'none' && (
                          <Button
                            onClick={() => sendFriendRequest(user.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Friend Requests</h3>
              {friendRequests.length === 0 ? (
                <p className="text-gray-300 text-center py-4">No pending requests</p>
              ) : (
                <div className="space-y-2">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-white font-medium">{request.sender.name}</p>
                        <p className="text-sm text-gray-400">{request.sender.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleFriendRequest(request.id, 'accept')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleFriendRequest(request.id, 'decline')}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'invites' && (
            <motion.div
              key="invites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Game Invites</h3>
              {gameInvites.length === 0 ? (
                <p className="text-gray-300 text-center py-4">No pending invites</p>
              ) : (
                <div className="space-y-2">
                  {gameInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {invite.sender.name} invited you to play
                        </p>
                        <p className="text-sm text-gray-400">
                          {invite.game.rounds[0]?.actor1} & {invite.game.rounds[0]?.actor2}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleGameInvite(invite.id, 'accept')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                        <Button
                          onClick={() => handleGameInvite(invite.id, 'decline')}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
