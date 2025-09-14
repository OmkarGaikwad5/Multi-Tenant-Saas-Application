'use client'

import { useState } from 'react'
import { Save, X, FileText } from 'lucide-react'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function NoteEditor({ note, user, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)

    try {
      const token = Cookies.get('token')
      const url = note ? `/api/notes/${note._id}` : '/api/notes'
      const method = note ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      })

      if (response.ok) {
        toast.success(note ? 'Note updated successfully!' : 'Note created successfully!')
        onSave()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error('Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {note ? 'Edit Note' : 'Create New Note'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="btn-secondary flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                  Note Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-primary text-xl font-semibold"
                  placeholder="Enter your note title..."
                  maxLength="200"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {title.length}/200 characters
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-3">
                  Note Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-primary resize-none leading-relaxed"
                  placeholder="Write your note content here..."
                  rows={20}
                  maxLength="10000"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {content.length}/10,000 characters
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}