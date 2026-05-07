import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCw, BookOpen } from 'lucide-react'

function FlashcardsPage({ flashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = flashcards[currentIndex]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150)
    }
  }

  const handleShuffle = () => {
    setIsFlipped(false)
    setCurrentIndex(Math.floor(Math.random() * flashcards.length))
  }

  const progress = ((currentIndex + 1) / flashcards.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary-600" />
            Flashcards
          </h2>
          <p className="text-gray-600 mt-1">
            Click the card to flip it
          </p>
        </div>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCw className="h-4 w-4" />
          Shuffle
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Card {currentIndex + 1} of {flashcards.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="relative h-80 mb-8">
        <div
          className={`card-flip w-full h-full cursor-pointer ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
        >
          <div className="card-inner">
            {/* Front */}
            <div className="card-front">
              <div className="text-center">
                {currentCard.category && (
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full mb-4">
                    {currentCard.category}
                  </span>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentCard.front}
                </h3>
                <p className="text-sm text-gray-500 mt-4">
                  Click to reveal answer
                </p>
              </div>
            </div>

            {/* Back */}
            <div className="card-back">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Answer
                </h3>
                <p className="text-lg text-gray-700">
                  {currentCard.back}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default FlashcardsPage
