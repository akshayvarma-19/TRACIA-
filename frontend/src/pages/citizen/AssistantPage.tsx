import React, { useState } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { assistantService } from '../../services/assistantService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const CitizenAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await assistantService.sendAssistantMessage(currentInput);
      setLoading(false);

      if (res.success && res.data?.message) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.error || 'AI Assistant is currently unavailable.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      setLoading(false);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: err.message || 'Failed to connect to assistant service.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#034E4E] tracking-tight flex items-center space-x-2">
          <Bot className="w-6 h-6 text-[#034E4E]" />
          <span>AI Land Assistance Portal</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Ask questions regarding Tamil Nadu land title procedures, OCR verification, or grievance resolution steps.
        </p>
      </div>

      <ErrorAlert
        title="AI Service Notice"
        message="AI assistance is powered securely through the Express backend."
      />

      {/* Chat Container */}
      <div className="flex-1 tracia-card flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#667085] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF4F3] text-[#034E4E] flex items-center justify-center border border-[#0B6868]/20">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#101828]">How can I assist you today?</h3>
              <p className="text-xs text-[#667085] max-w-md">
                Type your question below regarding title verification, Patta registration, or survey number searching.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                    msg.sender === 'user' ? 'bg-[#034E4E]' : 'bg-[#012F2F]'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                </div>

                <div
                  className={`max-w-lg p-4 rounded-lg text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#034E4E] text-white'
                      : 'bg-[#F4F8F7] text-[#101828] border border-[#D9E2E1]'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-white/70' : 'text-[#667085]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-[#667085]">
              <Loader2 className="w-4 h-4 animate-spin text-[#034E4E]" />
              <span>AI is analyzing request...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-[#F4F8F7] border-t border-[#D9E2E1] flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about land records or grievance procedures..."
            className="flex-1 px-4 py-2.5 bg-white border border-[#D9E2E1] rounded-md text-xs focus:border-[#034E4E] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="tracia-btn-primary inline-flex items-center space-x-1.5 text-xs disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
