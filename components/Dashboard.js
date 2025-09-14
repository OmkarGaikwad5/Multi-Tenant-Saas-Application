'use client'

import { useState, useEffect } from 'react'
import { Plus, LogOut, Crown, FileText, Building2, Edit, Trash2, Search } from 'lucide-react'
import Cookies from 'js-cookie'
import NoteEditor from './NoteEditor'
import toast from 'react-hot-toast'

export default function Dashboard({ user, onLogout }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [upgrading, setUpgrading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fetchNotes = async () => {
    try {
      const token = Cookies.get('token')
      const response = await fetch('/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else {
        toast.error('Failed to load notes')
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleCreateNote = () => {
    setEditingNote(null)
    setShowEditor(true)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowEditor(true)
  }

  const handleDeleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const token = Cookies.get('token')
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setNotes(notes.filter(note => note._id !== id))
        toast.success('Note deleted successfully')
      } else {
        toast.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const token = Cookies.get('token')
      const response = await fetch(`/api/tenants/${user.tenantSlug}/upgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Successfully upgraded to Pro!')
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to upgrade subscription')
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setUpgrading(false)
    }
  }

  const handleNoteSaved = () => {
    setShowEditor(false)
    setEditingNote(null)
    fetchNotes()
  }

  const canCreateNote = user.subscriptionPlan === 'pro' || notes.length < 3

  if (showEditor) {
    return (
      <NoteEditor
        note={editingNote}
        user={user}
        onSave={handleNoteSaved}
        onCancel={() => setShowEditor(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Notes Dashboard</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{user.tenantName}</span>
                  {user.subscriptionPlan === 'pro' && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                    {user.subscriptionPlan}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{user.email}</div>
                <div className="text-xs text-gray-500 capitalize font-medium">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-gradient">Your Notes</h2>
            <p className="text-gray-600 mt-1">
              {user.subscriptionPlan === 'free' && (
                <>Free plan: <span className="font-semibold">{notes.length}/3</span> notes used</>
              )}
              {user.subscriptionPlan === 'pro' && (
                <>Pro plan: <span className="font-semibold">Unlimited</span> notes</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.subscriptionPlan === 'free' && user.role === 'admin' && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Crown className="h-4 w-4" />
                {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
              </button>
            )}

            <button
              onClick={handleCreateNote}
              disabled={!canCreateNote}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
          </div>
        </div>

        {/* Subscription Limit Warning */}
        {!canCreateNote && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8 animate-slide-up">
            <div className="flex items-start gap-3">
              <Crown className="h-6 w-6 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Subscription Limit Reached</h3>
                <p className="text-amber-700">
                  You&apos;ve reached the limit of 3 notes for the Free plan.
                  {user.role === 'admin' && ' Click "Upgrade to Pro" for unlimited notes.'}
                  {user.role === 'member' && ' Ask your admin to upgrade to Pro for unlimited notes.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {notes.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-primary pl-10"
              />
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `Try searching for something else or clear the search to see all notes.` 
                : 'Create your first note to get started organizing your thoughts and ideas.'
              }
            </p>
            {canCreateNote && !searchQuery && (
              <button
                onClick={handleCreateNote}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div key={note._id} className="card card-hover">
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg line-clamp-2">{note.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{note.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}