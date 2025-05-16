import React, { useRef, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: Date;
  is_read: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  friendName: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, friendName }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle size={32} className="text-primary-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
          <p className="text-gray-600 mb-4">
            Start a conversation with {friendName}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.sender_id === user?.id || message.sender_id === 'current' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
              message.sender_id === user?.id || message.sender_id === 'current'
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className={`text-xs mt-1 ${
              message.sender_id === user?.id || message.sender_id === 'current'
                ? 'text-primary-100'
                : 'text-gray-500'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;