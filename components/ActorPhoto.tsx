'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface ActorPhotoProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ActorPhoto({ src, name, size = 'md', className = '' }: ActorPhotoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Size configurations - Mobile Optimized
  const sizeConfig = {
    sm: 'w-8 h-8 sm:w-12 sm:h-12 text-xs sm:text-sm',
    md: 'w-12 h-12 sm:w-16 sm:h-16 text-sm sm:text-base',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-base sm:text-lg'
  }

  const sizeClasses = sizeConfig[size]

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Handle image load error
  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  // If no src or image failed to load, show fallback
  if (!src || imageError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`
          ${sizeClasses}
          ${className}
          bg-gradient-to-br from-gray-600 to-gray-700
          rounded-full
          flex items-center justify-center
          text-white font-bold
          shadow-lg
          border-2 border-gray-500
        `}
        title={name}
      >
        <User className="w-3/4 h-3/4" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${sizeClasses} ${className} relative`}
    >
      {/* Loading skeleton */}
      {imageLoading && (
        <div className={`
          ${sizeClasses}
          absolute inset-0
          bg-gradient-to-br from-gray-400 to-gray-500
          rounded-full
          animate-pulse
          flex items-center justify-center
        `}>
          <div className="w-3/4 h-3/4 bg-gray-300 rounded-full animate-pulse" />
        </div>
      )}

      {/* Actual image - Mobile Optimized */}
      <Image
        src={src}
        alt={name}
        onLoad={handleImageLoad}
        onError={handleImageError}
        width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        className={`
          ${sizeClasses}
          rounded-full
          object-cover
          shadow-md sm:shadow-lg
          border border-gray-300 sm:border-2
          transition-all duration-300
          ${imageLoading ? 'opacity-0' : 'opacity-100'}
        `}
        title={name}
      />
    </motion.div>
  )
}
