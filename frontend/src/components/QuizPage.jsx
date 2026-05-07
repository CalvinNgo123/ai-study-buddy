import React, { useState } from 'react'
import { CheckCircle, XCircle, HelpCircle, ArrowRight, RotateCw } from 'lucide-react'

function QuizPage({ quiz }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [quizComplete, setQuizComplete] = useState(false)

  const currentQuestion = quiz[currentIndex]

  const handleSelectAnswer = (index) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    if (isCorrect) setScore(score + 1)

    setAnswers([...answers, {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: isCorrect
    }])

    setShowResult(true)
  }

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setQuizComplete(false)
  }

  const progress = ((currentIndex + 1) / quiz.length) * 100

  if (quizComplete) {
    const percentage = Math.round((score / quiz.length) * 100)

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quiz Complete!
          </h2>

          <div className="mb-6">
            <div className={`text-6xl font-bold mb-2 ${
              percentage >= 80 ? 'text-green-600' : 
              percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {percentage}%
            </div>
            <p className="text-gray-600">
              You got {score} out of {quiz.length} questions correct
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {answers.map((answer, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  answer.correct ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {answer.correct ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm text-gray-700">
                  Question {idx + 1}: {answer.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
          >
            <RotateCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary-600" />
            Quiz Mode
          </h2>
          <p className="text-gray-600 mt-1">
            Test your knowledge
          </p>
        </div>
        <div className="text-sm font-medium text-gray-600">
          Score: {score}/{currentIndex + (showResult ? 1 : 0)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} of {quiz.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-all '

            if (showResult) {
              if (index === currentQuestion.correct_answer) {
                buttonClass += 'border-green-500 bg-green-50'
              } else if (index === selectedAnswer && index !== currentQuestion.correct_answer) {
                buttonClass += 'border-red-500 bg-red-50'
              } else {
                buttonClass += 'border-gray-200 opacity-50'
              }
            } else {
              if (selectedAnswer === index) {
                buttonClass += 'border-primary-500 bg-primary-50'
              } else {
                buttonClass += 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={buttonClass}
                disabled={showResult}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    showResult && index === currentQuestion.correct_answer
                      ? 'bg-green-500 text-white'
                      : showResult && index === selectedAnswer && index !== currentQuestion.correct_answer
                      ? 'bg-red-500 text-white'
                      : selectedAnswer === index
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showResult && currentQuestion.explanation && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedAnswer === currentQuestion.correct_answer
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              selectedAnswer === currentQuestion.correct_answer
                ? 'text-green-800'
                : 'text-red-800'
            }`}>
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {currentIndex < quiz.length - 1 ? 'Next Question' : 'See Results'}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizPage
