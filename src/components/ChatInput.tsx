import React, { useState } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-200 p-4 bg-white"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={disabled}
        />
        <button
          type="button"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          title="Add emoji"
        >
          <Smile size={20} />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          title="Voice message"
        >
          <Mic size={20} />
        </button>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="rounded-full bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;