'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ChatbotFAQPage() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    category: 'general',
    priority: 5,
  })

  // Fetch FAQs
  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chatbot/faq')
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.question || !formData.answer) {
      alert('Question and answer are required!')
      return
    }

    try {
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k)
      const url = editingId ? `/api/chatbot/faq?id=${editingId}` : '/api/chatbot/faq'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          keywords,
          category: formData.category,
          priority: Number(formData.priority),
        }),
      })

      if (response.ok) {
        alert(editingId ? 'FAQ updated successfully!' : 'FAQ created successfully!')
        fetchFAQs()
        resetForm()
        setShowModal(false)
      } else {
        alert('Failed to save FAQ')
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Error saving FAQ')
    }
  }

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords?.join(', ') || '',
      category: faq.category,
      priority: faq.priority,
    })
    setEditingId(faq.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const response = await fetch(`/api/chatbot/faq?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('FAQ deleted successfully!')
        fetchFAQs()
      } else {
        alert('Failed to delete FAQ')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Error deleting FAQ')
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      keywords: '',
      category: 'general',
      priority: 5,
    })
    setEditingId(null)
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || faq.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(faqs.map(f => f.category))]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chatbot FAQ Manager</h1>
            <p className="text-gray-600 mt-2">Add, edit, and manage chatbot Q&A</p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search questions or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* FAQs List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No FAQs found. Create one to get started!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <Card key={faq.id} className="p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 mb-3">{faq.answer}</p>
                    <div className="flex gap-2 flex-wrap items-center">
                      <span className="inline-block bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded">
                        {faq.category}
                      </span>
                      <span className="text-sm text-gray-500">Priority: {faq.priority}</span>
                      {faq.keywords?.length > 0 && (
                        <span className="text-sm text-gray-500">
                          Keywords: {faq.keywords.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(faq)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(faq.id)}
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

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                placeholder="Enter the question..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                placeholder="Enter the answer..."
                rows="6"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="general">General</option>
                  <option value="booking">Booking</option>
                  <option value="appointments">Appointments</option>
                  <option value="services">Services</option>
                  <option value="payment">Payment</option>
                  <option value="info">Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
              <Input
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="e.g., book, appointment, schedule"
                className="w-full"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'} FAQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
