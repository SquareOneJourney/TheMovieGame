'use client'

import { useEffect, useState } from 'react'

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Service worker registration removed - PWA functionality disabled for now
    // Can be re-enabled with Next.js 15 compatible PWA solution
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Install The Movie Game</h3>
              <p className="text-sm text-gray-600">Play offline and get a native app experience!</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
