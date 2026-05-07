import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Brain, Upload, BookOpen, HelpCircle } from 'lucide-react'
import UploadPage from './components/UploadPage'
import FlashcardsPage from './components/FlashcardsPage'
import QuizPage from './components/QuizPage'

function App() {
  const [studyData, setStudyData] = useState(null)
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Upload, label: 'Upload' },
    { path: '/flashcards', icon: BookOpen, label: 'Flashcards' },
    { path: '/quiz', icon: HelpCircle, label: 'Quiz' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Study Guide AI</h1>
            </div>

            {/* Navigation */}
            <nav className="flex gap-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${path !== '/' && !studyData ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<UploadPage setStudyData={setStudyData} />} />
          <Route 
            path="/flashcards" 
            element={
              studyData ? 
                <FlashcardsPage flashcards={studyData.flashcards} /> : 
                <NoDataMessage />
            } 
          />
          <Route 
            path="/quiz" 
            element={
              studyData ? 
                <QuizPage quiz={studyData.quiz} /> : 
                <NoDataMessage />
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

function NoDataMessage() {
  return (
    <div className="text-center py-16">
      <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-600 mb-2">No Study Material Yet</h2>
      <p className="text-gray-500">Upload some notes first to generate flashcards and quizzes!</p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Upload className="h-4 w-4" />
        Upload Notes
      </Link>
    </div>
  )
}

export default App
