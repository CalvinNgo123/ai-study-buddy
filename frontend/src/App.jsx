import React, { useState, useRef } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Brain, Upload, BookOpen, HelpCircle, Download, FileUp } from 'lucide-react'
import UploadPage from './components/UploadPage'
import FlashcardsPage from './components/FlashcardsPage'
import QuizPage from './components/QuizPage'

function App() {
  const [studyData, setStudyData] = useState(null)
  const [importError, setImportError] = useState(null)
  const location = useLocation()
  const fileInputRef = useRef(null)

  const navItems = [
    { path: '/', icon: Upload, label: 'Upload' },
    { path: '/flashcards', icon: BookOpen, label: 'Flashcards' },
    { path: '/quiz', icon: HelpCircle, label: 'Quiz' },
  ]

  const downloadStudyGuide = () => {
    if (!studyData) return

    const dataStr = JSON.stringify(studyData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `study-guide-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImportError(null)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        // Validate the imported data has required fields
        if (!data.flashcards || !data.quiz || !data.summary) {
          setImportError('Invalid study guide file. Missing required fields.')
          return
        }

        setStudyData(data)
        setImportError(null)
      } catch (err) {
        setImportError('Could not read file. Please make sure it is a valid study guide JSON file.')
      }
    }

    reader.onerror = () => {
      setImportError('Error reading file.')
    }

    reader.readAsText(file)

    // Reset input so same file can be selected again
    event.target.value = ''
  }

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

            <div className="flex items-center gap-2">
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

              {/* Action Buttons */}
              {studyData && (
                <button
                  onClick={downloadStudyGuide}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors ml-2"
                  title="Save study guide to your computer"
                >
                  <Download className="h-4 w-4" />
                  Save
                </button>
              )}

              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ml-2"
                title="Load a saved study guide"
              >
                <FileUp className="h-4 w-4" />
                Load
              </button>

              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {importError && (
            <div className="px-4 pb-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{importError}</p>
              </div>
            </div>
          )}
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
      <p className="text-gray-500 mb-4">Upload some notes first to generate flashcards and quizzes!</p>
      <p className="text-gray-400 text-sm">Or load a previously saved study guide using the Load button above.</p>
    </div>
  )
}

export default App
