'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Download, Wifi, WifiOff } from 'lucide-react'

// Global flag to prevent multiple calls across all instances
let globalHasChecked = false

export default function PWATestPage() {
  const [pwaFeatures, setPwaFeatures] = useState({
    serviceWorker: false,
    installable: false,
    offline: false,
    manifest: false,
    cache: false,
    manifestData: null as any
  })

  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false)
  const [hasServiceWorkerSupport, setHasServiceWorkerSupport] = useState(false)
  const [hasLocalStorageSupport, setHasLocalStorageSupport] = useState(false)
  const [hasIndexedDBSupport, setHasIndexedDBSupport] = useState(false)
  const [hasNotificationSupport, setHasNotificationSupport] = useState(false)

  const checkPWAFeatures = useCallback(async () => {
    console.log('PWA Test: checkPWAFeatures called, globalHasChecked:', globalHasChecked)
    
    if (globalHasChecked) {
      console.log('PWA Test: Already checked globally, skipping...')
      return
    }
    
    console.log('PWA Test: Checking PWA features...')
    globalHasChecked = true
    
    const features = {
      serviceWorker: false,
      installable: false,
      offline: false,
      manifest: false,
      cache: false,
      manifestData: null as any
    }

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        features.serviceWorker = !!registration
        console.log('PWA Test: Service worker status:', features.serviceWorker, registration)
      } catch (error) {
        console.error('PWA Test: Service worker check failed:', error)
        features.serviceWorker = false
      }
    } else {
      console.log('PWA Test: Service workers not supported')
    }

    // Check if installable
    features.installable = !!installPrompt
    console.log('PWA Test: Installable status:', features.installable, installPrompt)

    // Check manifest
    try {
      const response = await fetch('/manifest.json')
      if (response.ok) {
        features.manifest = true
        features.manifestData = await response.json()
        console.log('PWA Test: Manifest loaded successfully')
      } else {
        console.error('PWA Test: Manifest fetch failed:', response.status)
      }
    } catch (error) {
      console.error('PWA Test: Manifest check failed:', error)
      features.manifest = false
    }

    // Check cache
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        features.cache = cacheNames.length > 0
        console.log('PWA Test: Cache status:', features.cache, cacheNames)
      } catch (error) {
        console.error('PWA Test: Cache check failed:', error)
        features.cache = false
      }
    } else {
      console.log('PWA Test: Cache API not supported')
    }

    console.log('PWA Test: Final features status:', features)
    setPwaFeatures(features)
  }, [installPrompt])

  useEffect(() => {
    if (globalHasChecked) return

    globalHasChecked = true
    checkPWAFeatures()

    // Check browser support
    setHasServiceWorkerSupport('serviceWorker' in navigator)
    setHasLocalStorageSupport('localStorage' in window)
    setHasIndexedDBSupport('indexedDB' in window)
    setHasNotificationSupport('Notification' in window)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerRegistered(true)
      })
    }

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
  }, [checkPWAFeatures]) // Empty dependency array - only run once on mount

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

  const handleOfflineTest = () => {
    alert('To test offline: Install the app, then disconnect your internet and try playing the game!')
  }

  const handleRefresh = () => {
    globalHasChecked = false
    checkPWAFeatures()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 text-white">
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
                  <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {status ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Installation</h3>
            <div className="space-y-4">
              <button
                onClick={handleRefresh}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                🔄 Refresh PWA Status
              </button>
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
                onClick={handleOfflineTest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <WifiOff className="w-5 h-5 mr-2" />
                Test Offline Mode
              </button>
            </div>
          </div>
        </div>

        {/* How to Test */}
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
                <li>After installing, open the app from your home screen/desktop</li>
                <li>It should open in full screen without browser UI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}