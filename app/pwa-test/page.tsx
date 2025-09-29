'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Download, Wifi, WifiOff } from 'lucide-react'

export default function PWATestPage() {
  const [pwaFeatures, setPwaFeatures] = useState({
    serviceWorker: false,
    installable: false,
    offline: false,
    manifest: false,
    cache: false
  })

  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  const checkPWAFeatures = useCallback(async () => {
    const features = { ...pwaFeatures }

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        features.serviceWorker = !!registration
      } catch (error) {
        features.serviceWorker = false
      }
    }

    // Check if installable
    features.installable = !!installPrompt

    // Check manifest
    try {
      const response = await fetch('/manifest.json')
      features.manifest = response.ok
    } catch (error) {
      features.manifest = false
    }

    // Check cache
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        features.cache = cacheNames.length > 0
      } catch (error) {
        features.cache = false
      }
    }

    setPwaFeatures(features)
  }, [pwaFeatures, installPrompt])

  useEffect(() => {
    // Check PWA features
    checkPWAFeatures()
    
    // Check online status
    setIsOnline(navigator.onLine)
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    // Check for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [checkPWAFeatures])

  const handleInstall = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    setInstallPrompt(null)
  }

  const testOffline = () => {
    // Simulate offline by disabling network requests
    console.log('Testing offline functionality...')
    alert('Disconnect your internet and try playing the game!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🧪 PWA Test Dashboard
        </h1>

        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Connection Status</h2>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 font-semibold">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-6 h-6 text-red-400" />
                  <span className="text-red-400 font-semibold">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PWA Features Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">PWA Features</h3>
            <div className="space-y-3">
              {Object.entries(pwaFeatures).map(([feature, status]) => (
                <div key={feature} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {status ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Installation</h3>
            <div className="space-y-4">
              {installPrompt ? (
                <button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Install App</span>
                </button>
              ) : (
                <div className="text-center text-gray-300">
                  <p>App is already installed or not installable</p>
                  <p className="text-sm mt-2">Try refreshing the page</p>
                </div>
              )}
              
              <button
                onClick={testOffline}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Test Offline Mode
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">How to Test PWA Features</h3>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Install the App:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Look for install button above (if available)</li>
                <li>Or look for install icon in browser address bar</li>
                <li>On mobile: &quot;Add to Home Screen&quot; prompt</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">2. Test Offline Mode:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Click &quot;Test Offline Mode&quot; button above</li>
                <li>Disconnect your internet</li>
                <li>Go to the main game and try playing</li>
                <li>App should work without internet!</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">3. Test Native App Feel:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Install the app</li>
                <li>Open from home screen/app drawer</li>
                <li>Should open in full screen (no browser UI)</li>
                <li>Should feel like a native app</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">4. Test Performance:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>App should load very fast after first visit</li>
                <li>Images should be cached</li>
                <li>Should work smoothly on mobile</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <a
            href="/"
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            🏠 Home
          </a>
          <a
            href="/singleplayer"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
          >
            🎮 Play Game
          </a>
        </div>
      </div>
    </div>
  )
}
