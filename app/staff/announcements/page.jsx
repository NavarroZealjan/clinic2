'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Trash2, Edit2, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in title and message')
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
        fetchAnnouncements()
        setShowModal(false)
        setFormData({ title: '', message: '', category: 'General', expiresAt: '' })
        setEditingId(null)
        alert('Announcement saved successfully!')
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
      category: announcement.category || 'General',
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

  const handleNewAnnouncement = () => {
    setEditingId(null)
    setFormData({ title: '', message: '', category: 'General', expiresAt: '' })
    setShowModal(true)
  }

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff" className="text-blue-500 hover:text-blue-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Clinic Announcements</h1>
            <p className="text-gray-600">Post updates about clinic hours, services, and events</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 gap-4">
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleNewAnnouncement} className="bg-blue-600 hover:bg-blue-700 flex gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">No announcements yet</p>
            <Button onClick={handleNewAnnouncement} className="bg-blue-600 hover:bg-blue-700">
              Create First Announcement
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map(announcement => (
              <Card key={announcement.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {announcement.category || 'General'}
                      </span>
                      {announcement.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{announcement.message}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Posted: {new Date(announcement.created_at).toLocaleDateString()}</span>
                      {announcement.expires_at && (
                        <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
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
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Today's Clinic Hours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="e.g., The clinic will open at 1 PM today due to maintenance"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General">General</option>
                  <option value="Hours">Hours</option>
                  <option value="Service">Service</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Event">Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expires At (optional)</label>
                <Input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {editingId ? 'Update' : 'Post'} Announcement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
