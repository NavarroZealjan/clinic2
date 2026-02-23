'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2, X } from 'lucide-react'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'General',
    expiresAt: '',
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/announcements')
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.message) {
      alert('Title and message are required')
      return
    }

    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingId(null)
        setFormData({ title: '', message: '', category: 'General', expiresAt: '' })
        fetchAnnouncements()
        alert('Announcement saved!')
      }
    } catch (error) {
      console.error('Error saving announcement:', error)
      alert('Failed to save announcement')
    }
  }

  const handleEdit = (announcement) => {
    setEditingId(announcement.id)
    setFormData({
      title: announcement.title,
      message: announcement.message,
      category: announcement.category,
      expiresAt: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return

    try {
      const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchAnnouncements()
        alert('Announcement deleted!')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Failed to delete announcement')
    }
  }

  const getStatusBadge = (announcement) => {
    if (!announcement.is_active) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
    }
    if (announcement.expires_at && new Date(announcement.expires_at) < new Date()) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Expired</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clinic Announcements</h1>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData({ title: '', message: '', category: 'General', expiresAt: '' })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + New Announcement
        </Button>
      </div>

      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <p>No announcements yet. Create one to get started!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <p className="text-gray-600 mt-2">{announcement.message}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>Category: {announcement.category}</span>
                    {announcement.expires_at && (
                      <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 items-center">
                  {getStatusBadge(announcement)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Create'} Announcement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Today's Clinic Hours"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g., The clinic will open at 1 PM today due to maintenance"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>General</option>
                  <option>Hours</option>
                  <option>Maintenance</option>
                  <option>Special Event</option>
                </select>
              </div>

              <div>
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingId ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
