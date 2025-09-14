'use client'

import { useState, useEffect } from 'react'
import { Plus, LogOut, Crown, FileText, Building2, Edit, Trash2, Search } from 'lucide-react'
import Cookies from 'js-cookie'
import NoteEditor from './NoteEditor'
import toast from 'react-hot-toast'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'

export default function Dashboard({ user, onLogout }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [upgrading, setUpgrading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tenantPlan, setTenantPlan] = useState(user.subscriptionPlan)
  const [showConfetti, setShowConfetti] = useState(false)

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

      const data = await response.json()

      if (response.ok) {
        toast.success('Successfully upgraded to Pro!')
        setTenantPlan('pro')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      } else {
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

  const canCreateNote = tenantPlan === 'pro' || notes.length < 3

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
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 gap-3 sm:gap-0 py-3 sm:py-0">
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notes Dashboard</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{user.tenantName}</span>
                  {tenantPlan === 'pro' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="inline-flex items-center"
                    >
                      <Crown className="h-4 w-4 text-yellow-500 animate-bounce-slow" />
                    </motion.div>
                  )}
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                    {tenantPlan}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 sm:mt-0 flex-wrap sm:flex-nowrap">
              <div className="text-right">
                <div className="text-sm sm:text-base font-semibold text-gray-900">{user.email}</div>
                <div className="text-xs sm:text-sm text-gray-500 capitalize font-medium">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Notes</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {tenantPlan === 'free' && <>Free plan: <span className="font-semibold">{notes.length}/3</span> notes used</>}
              {tenantPlan === 'pro' && <>Pro plan: <span className="font-semibold">Unlimited</span> notes</>}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {tenantPlan === 'free' && user.role === 'admin' && (
              <motion.button
                onClick={handleUpgrade}
                disabled={upgrading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Crown className="h-4 w-4" />
                {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
              </motion.button>
            )}

            <button
              onClick={handleCreateNote}
              disabled={!canCreateNote}
              className="btn-primary flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              New Note
            </button>
          </div>
        </div>

        {/* Subscription Warning */}
        {!canCreateNote && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Crown className="h-6 w-6 text-amber-500" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1 text-sm sm:text-base">Subscription Limit Reached</h3>
                <p className="text-amber-700 text-xs sm:text-sm">
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
          <div className="mb-8 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-primary pl-10 w-full"
              />
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-center py-20 px-4 sm:px-6">
            <div className="mx-auto h-24 w-24 sm:h-32 sm:w-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm sm:text-base">
              {searchQuery 
                ? `Try searching for something else or clear the search to see all notes.` 
                : 'Create your first note to get started organizing your thoughts and ideas.'}
            </p>
            {canCreateNote && !searchQuery && (
              <button
                onClick={handleCreateNote}
                className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div key={note._id} className="card card-hover">
                <div className="p-4 sm:p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg line-clamp-2">{note.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">{note.content}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="text-xs text-gray-500 font-medium">{new Date(note.createdAt).toLocaleDateString('en-US', {
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
