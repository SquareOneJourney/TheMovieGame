'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export default function PWADebugPage() {
  const [debugInfo, setDebugInfo] = useState({
    isHTTPS: false,
    hasManifest: false,
    hasServiceWorker: false,
    isInstallable: false,
    userAgent: '',
    beforeInstallPrompt: false,
    manifestData: null as any
  })

  useEffect(() => {
    const checkPWAStatus = async () => {
      const info = {
        isHTTPS: location.protocol === 'https:',
        hasManifest: false,
        hasServiceWorker: false,
        isInstallable: false,
        userAgent: navigator.userAgent,
        beforeInstallPrompt: false,
        manifestData: null
      }

      // Check manifest
      try {
        const manifestResponse = await fetch('/manifest.json')
        if (manifestResponse.ok) {
          info.hasManifest = true
          info.manifestData = await manifestResponse.json()
        }
      } catch (error) {
        console.error('Manifest check failed:', error)
      }

      // Check service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          info.hasServiceWorker = !!registration
        } catch (error) {
          console.error('Service worker check failed:', error)
        }
      }

      // Check if installable
      info.isInstallable = 'BeforeInstallPromptEvent' in window

      setDebugInfo(info)
    }

    checkPWAStatus()

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired!', e)
      setDebugInfo(prev => ({ ...prev, beforeInstallPrompt: true }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-6 h-6 text-green-400" />
    ) : (
      <XCircle className="w-6 h-6 text-red-400" />
    )
  }

  const getHTTPSStatus = () => {
    if (debugInfo.isHTTPS) {
      return <CheckCircle className="w-6 h-6 text-green-400" />
    } else {
      return (
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-6 h-6 text-yellow-400" />
          <span className="text-yellow-400 text-sm">Localhost OK for testing</span>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🔍 PWA Debug Dashboard
        </h1>

        {/* PWA Requirements Status */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">PWA Requirements Status</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">HTTPS/SSL</span>
                {getHTTPSStatus()}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Manifest.json</span>
                {getStatusIcon(debugInfo.hasManifest)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Service Worker</span>
                {getStatusIcon(debugInfo.hasServiceWorker)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Installable</span>
                {getStatusIcon(debugInfo.isInstallable)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Before Install Prompt</span>
                {getStatusIcon(debugInfo.beforeInstallPrompt)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">PWA Support</span>
                {getStatusIcon('serviceWorker' in navigator)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Cache API</span>
                {getStatusIcon('caches' in window)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Fetch API</span>
                {getStatusIcon('fetch' in window)}
              </div>
            </div>
          </div>
        </div>

        {/* Manifest Data */}
        {debugInfo.manifestData && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Manifest Data</h3>
            <div className="bg-black/20 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                {JSON.stringify(debugInfo.manifestData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* User Agent */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Browser Information</h3>
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-gray-300 text-sm break-all">{debugInfo.userAgent}</p>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">How to Install the App</h3>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Desktop (Chrome/Edge):</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Look for install icon in address bar (usually a download/plus icon)</li>
                <li>Or go to menu → Install The Movie Game</li>
                <li>Or press Ctrl+Shift+I → Application → Manifest → Install</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Mobile (Android/iPhone):</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Look for &quot;Add to Home Screen&quot; banner</li>
                <li>Or go to browser menu → Add to Home Screen</li>
                <li>Or go to browser menu → Install App</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">If Install Option Not Showing:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Make sure you&apos;re on HTTPS (not localhost)</li>
                <li>Try refreshing the page</li>
                <li>Check if app is already installed</li>
                <li>Try in incognito/private mode</li>
                <li>Make sure browser supports PWA</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Manual Install Instructions */}
        <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-yellow-400 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Manual Installation</h3>
              <p className="text-yellow-200 mb-4">
                If the automatic install prompt doesn&apos;t appear, you can manually install:
              </p>
              <div className="space-y-2 text-yellow-200">
                <p><strong>Chrome:</strong> Menu (⋮) → Install The Movie Game</p>
                <p><strong>Edge:</strong> Menu (⋯) → Apps → Install this site as an app</p>
                <p><strong>Firefox:</strong> Menu (☰) → Install</p>
                <p><strong>Safari:</strong> Share → Add to Home Screen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex justify-center space-x-4">
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
          <a
            href="/pwa-test"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            🧪 PWA Test
          </a>
        </div>
      </div>
    </div>
  )
}
