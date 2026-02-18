"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Save, 
  Check, 
  Clock, 
  Edit3, 
  Trash2, 
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export function DoctorNotesDrafting({ patientId, doctorId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeNote, setActiveNote] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState(null)
  const [newNote, setNewNote] = useState({ title: "", content: "" })
  const autoSaveTimer = useRef(null)
  const lastSavedContent = useRef({ title: "", content: "" })

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes()
  }, [patientId])

  // Auto-save effect for active note
  useEffect(() => {
    if (activeNote && activeNote.status === 'draft') {
      const hasChanges = 
        activeNote.title !== lastSavedContent.current.title ||
        activeNote.content !== lastSavedContent.current.content

      if (hasChanges) {
        setAutoSaveStatus('pending')
        
        if (autoSaveTimer.current) {
          clearTimeout(autoSaveTimer.current)
        }

        autoSaveTimer.current = setTimeout(() => {
          autoSaveNote()
        }, 3000)
      }
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [activeNote])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching notes for patient:", patientId)
      const response = await fetch(`/api/patients/${patientId}/notes`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Notes fetched successfully:", data)
        setNotes(data)
      } else {
        console.log("[v0] Error response status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const autoSaveNote = async () => {
    if (!activeNote || activeNote.status !== 'draft') return

    try {
      setAutoSaveStatus('saving')
      
      const response = await fetch(`/api/patients/${patientId}/notes?noteId=${activeNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeNote.title,
          content: activeNote.content,
        }),
      })

      if (response.ok) {
        lastSavedContent.current = {
          title: activeNote.title,
          content: activeNote.content
        }
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus(null), 2000)
      } else {
        setAutoSaveStatus('error')
      }
    } catch (error) {
      console.error("Auto-save error:", error)
      setAutoSaveStatus('error')
    }
  }

  const createNewNote = async () => {
    if (!newNote.content.trim()) return

    try {
      const response = await fetch(`/api/patients/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNote.title || `Note - ${new Date().toLocaleDateString()}`,
          content: newNote.content,
          status: 'draft',
          doctorId,
        }),
      })

      if (response.ok) {
        const savedNote = await response.json()
        setNotes([savedNote, ...notes])
        setNewNote({ title: "", content: "" })
        setIsCreating(false)
        setActiveNote(savedNote)
        lastSavedContent.current = {
          title: savedNote.title,
          content: savedNote.content
        }
      }
    } catch (error) {
      console.error("Error creating note:", error)
    }
  }

  const finalizeNote = async (noteId) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/notes?noteId=${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'finalized' }),
      })

      if (response.ok) {
        setNotes(notes.map(n => 
          n.id === noteId ? { ...n, status: 'finalized' } : n
        ))
        if (activeNote?.id === noteId) {
          setActiveNote({ ...activeNote, status: 'finalized' })
        }
      }
    } catch (error) {
      console.error("Error finalizing note:", error)
    }
  }

  const deleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`/api/patients/${patientId}/notes?entryId=${noteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId))
        if (activeNote?.id === noteId) {
          setActiveNote(null)
        }
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const selectNote = (note) => {
    setActiveNote(note)
    lastSavedContent.current = {
      title: note.title || "",
      content: note.content || ""
    }
    setIsCreating(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Doctor Notes
        </h3>
        <Button 
          onClick={() => { setIsCreating(true); setActiveNote(null); }}
          className="bg-sky-500 hover:bg-sky-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Draft
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notes List */}
        <div className="lg:col-span-1 space-y-2">
          <h4 className="font-medium text-sm text-gray-500 mb-2">All Notes</h4>
          
          {notes.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm">Click "New Draft" to start</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {notes.map((note) => (
                <Card 
                  key={note.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    activeNote?.id === note.id 
                      ? 'ring-2 ring-sky-500 bg-sky-50' 
                      : ''
                  } ${note.status === 'draft' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-green-500'}`}
                  onClick={() => selectNote(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {note.title || "Untitled Note"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {note.content?.substring(0, 50)}...
                      </p>
                    </div>
                    <Badge 
                      variant={note.status === 'draft' ? 'outline' : 'default'}
                      className={note.status === 'draft' 
                        ? 'bg-amber-100 text-amber-700 border-amber-300' 
                        : 'bg-green-100 text-green-700 border-green-300'
                      }
                    >
                      {note.status === 'draft' ? 'Draft' : 'Final'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(note.updated_at || note.created_at)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2">
          {isCreating ? (
            <Card className="p-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                New Note (Draft)
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Note title (optional)"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Content</label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Start typing your notes here..."
                    rows={10}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { setIsCreating(false); setNewNote({ title: "", content: "" }); }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createNewNote}
                    className="bg-sky-500 hover:bg-sky-600"
                    disabled={!newNote.content.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </div>
            </Card>
          ) : activeNote ? (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  {activeNote.status === 'draft' ? 'Edit Draft' : 'View Note'}
                </h4>
                
                <div className="flex items-center gap-2">
                  {/* Auto-save indicator */}
                  {activeNote.status === 'draft' && autoSaveStatus && (
                    <span className={`text-xs flex items-center gap-1 ${
                      autoSaveStatus === 'saving' ? 'text-blue-500' :
                      autoSaveStatus === 'saved' ? 'text-green-500' :
                      autoSaveStatus === 'error' ? 'text-red-500' :
                      'text-gray-400'
                    }`}>
                      {autoSaveStatus === 'saving' && <Clock className="w-3 h-3 animate-spin" />}
                      {autoSaveStatus === 'saved' && <CheckCircle className="w-3 h-3" />}
                      {autoSaveStatus === 'error' && <AlertCircle className="w-3 h-3" />}
                      {autoSaveStatus === 'pending' && <Clock className="w-3 h-3" />}
                      {autoSaveStatus === 'saving' ? 'Saving...' :
                       autoSaveStatus === 'saved' ? 'Saved' :
                       autoSaveStatus === 'error' ? 'Error saving' :
                       'Unsaved changes'}
                    </span>
                  )}
                  
                  <Badge 
                    className={activeNote.status === 'draft' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-green-100 text-green-700'
                    }
                  >
                    {activeNote.status === 'draft' ? 'Draft' : 'Finalized'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <Input
                    value={activeNote.title || ""}
                    onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                    placeholder="Note title"
                    className="mt-1"
                    disabled={activeNote.status === 'finalized'}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Content</label>
                  <Textarea
                    value={activeNote.content || ""}
                    onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                    placeholder="Note content..."
                    rows={10}
                    className="mt-1"
                    disabled={activeNote.status === 'finalized'}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    {activeNote.last_auto_saved && (
                      <span>Last saved: {formatDate(activeNote.last_auto_saved)}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteNote(activeNote.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    
                    {activeNote.status === 'draft' && (
                      <Button 
                        onClick={() => finalizeNote(activeNote.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Finalize Note
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a note to view or edit</p>
              <p className="text-sm mt-2">Or create a new draft to get started</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
