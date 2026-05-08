import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, Type } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api'

function UploadPage({ setStudyData }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [activeTab, setActiveTab] = useState('file') // 'file' or 'text'

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    await processFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const processFile = async (file) => {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })

      setStudyData(response.data)
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.message || 
        'An error occurred while processing your file.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const processText = async () => {
    if (!textInput.trim() || textInput.trim().length < 50) {
      setError('Please enter at least 50 characters of text.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `${API_URL}/generate-from-text`,
        { text: textInput },
        { timeout: 120000 }
      )

      setStudyData(response.data)
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.message || 
        'An error occurred while generating study materials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Create Your Study Guide
        </h2>
        <p className="text-gray-600">
          Upload your notes or paste text to generate AI-powered flashcards and quizzes
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeTab === 'file'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeTab === 'text'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Type className="h-4 w-4" />
          Paste Text
        </button>
      </div>

      {activeTab === 'file' ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
        >
          <input {...getInputProps()} />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
              <p className="text-lg font-medium text-gray-700">
                Generating study materials...
              </p>
              <p className="text-sm text-gray-500">
                This may take a minute while the AI analyzes your content
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['.txt', '.pdf', '.docx', '.md'].map((ext) => (
                  <span
                    key={ext}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your notes here... (minimum 50 characters)"
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              {textInput.length} characters
            </span>
            <button
              onClick={processText}
              disabled={isLoading || textInput.length < 50}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Generate Study Guide
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default UploadPage
