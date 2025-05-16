import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Smile, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface KimsoulChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

const KimsoulChatInput: React.FC<KimsoulChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  suggestions
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="rounded-lg border border-gray-300 bg-white overflow-hidden shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isArabic ? "اسأل كيمسول سؤالاً طبياً..." : "Ask Kimsoul a medical question..."}
          className="w-full px-4 py-3 text-sm outline-none resize-none min-h-[60px] max-h-[200px]"
          rows={1}
          disabled={isLoading}
          dir={isArabic ? "rtl" : "ltr"}
        />
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
          <div className="flex items-center space-x-2">
            <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 transition-colors">
              <Mic size={18} />
            </button>
            <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 transition-colors">
              <Paperclip size={18} />
            </button>
            <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 transition-colors">
              <Smile size={18} />
            </button>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className="rounded-md bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      {/* Quick Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="flex items-center space-x-1 rounded-full bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles size={14} className="text-indigo-500" />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default KimsoulChatInput;