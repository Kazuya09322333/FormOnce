'use client'

import { Button } from '@components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { EQuestionType, TQuestion } from '~/types/question.types'

type VideoAskPlayerProps = {
  videoUrl: string
  question: TQuestion
  onAnswerSelect: (answer: string, skipTo?: string) => void
  autoPlay?: boolean
}

export const VideoAskPlayer = ({
  videoUrl,
  question,
  onAnswerSelect,
  autoPlay = true,
}: VideoAskPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCTAs, setShowCTAs] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      // Show CTAs when video is near the end (last 3 seconds) or paused
      const timeRemaining = video.duration - video.currentTime
      if (timeRemaining <= 3 || video.paused) {
        setShowCTAs(true)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => {
      setIsPlaying(false)
      setShowCTAs(true)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setShowCTAs(true)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    if (autoPlay) {
      video.play().catch(console.error)
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [autoPlay])

  const handleCTAClick = (option: string, logic?: any) => {
    // Find the logic rule for this option (using ELogicCondition.IS instead of 'equals')
    const logicRule = question.logic?.find((l) => l.value === option)
    const skipTo = logicRule?.skipTo || question.logic?.[0]?.skipTo

    onAnswerSelect(option, skipTo)
  }

  // Type guard to safely access options
  const options = question.type === EQuestionType.Select ? question.options : []

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* 9:16 Aspect Ratio Container */}
      <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
        {/* Video Player */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover rounded-2xl bg-black"
          playsInline
          controls={false}
          onClick={() => {
            if (videoRef.current) {
              if (videoRef.current.paused) {
                videoRef.current.play()
              } else {
                videoRef.current.pause()
              }
            }
          }}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="white"
                className="ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Question Title Overlay */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold">
              {question.title}
            </h3>
          </div>
        </div>

        {/* CTA Buttons Overlay */}
        {showCTAs && options.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="space-y-3">
              {options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleCTAClick(option)}
                  className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                  style={{
                    animation: `slideUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{
              width: videoRef.current
                ? `${
                    (videoRef.current.currentTime / videoRef.current.duration) *
                    100
                  }%`
                : '0%',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
