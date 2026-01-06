"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  // Generate session ID on mount
  useEffect(() => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(id)
  }, [])

  // Fetch suggestions
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions()
    }
  }, [isOpen, suggestions.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text: "Hello! I'm your E-CLINIC virtual assistant. How can I help you today?",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch("/api/chatbot/suggestions")
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return

    // Add user message
    const userMessage = {
      id: `user_${Date.now()}`,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call chatbot API
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          sessionId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Add bot response
        const botMessage = {
          id: `bot_${Date.now()}`,
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: "Sorry, I'm having trouble connecting. Please try again or contact our staff directly.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (question) => {
    sendMessage(question)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-cyan-500 hover:bg-cyan-600 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 border-2">
      {/* Header */}
      <div className="bg-cyan-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-semibold">E-CLINIC Support</h3>
            <p className="text-xs text-cyan-100">Online • Ask me anything</p>
          </div>
        </div>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-cyan-600">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-cyan-500 text-white rounded-br-none"
                  : "bg-white text-slate-900 rounded-bl-none shadow-sm"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === "user" ? "text-cyan-100" : "text-slate-500"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 rounded-lg rounded-bl-none shadow-sm p-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            </div>
          </div>
        )}

        {/* Quick Suggestions */}
        {messages.length === 1 && suggestions.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-slate-500 font-medium">Quick questions:</p>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion.question)}
                className="w-full text-left p-2 text-sm bg-white hover:bg-cyan-50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-colors"
              >
                {suggestion.question}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="bg-cyan-500 hover:bg-cyan-600">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
