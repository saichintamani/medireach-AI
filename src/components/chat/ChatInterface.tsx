"use client";

import { useState } from "react";
import { ChatMessage } from "./ChatMessage";

export function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello. I am MediReach, your rural emergency healthcare assistant. How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const newMessages = [...messages, { id: Date.now(), text: userText, isUser: true }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now(), text: data.text, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Network error. Please try again or seek professional help immediately if this is an emergency.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Disclaimer Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-800 text-center">
        <strong>Disclaimer:</strong> This AI provides information only and is not a substitute for professional medical advice. Call emergency services immediately if the situation is life-threatening.
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} text={msg.text} isUser={msg.isUser} />
        ))}
        {isLoading && (
          <div className="flex w-full justify-start mb-4">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm md:text-base border border-gray-200 animate-pulse">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSend} className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your emergency or question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white rounded-full px-6 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
