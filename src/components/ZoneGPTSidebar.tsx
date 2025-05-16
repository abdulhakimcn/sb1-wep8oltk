import React, { useState } from 'react';
import { Plus, Search, History, ChevronDown, Brain, Trash2, MoreVertical } from 'lucide-react';
import { Conversation } from '../types/chat';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ZoneGPTSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

const ZoneGPTSidebar: React.FC<ZoneGPTSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const { i18n } = useTranslation();
  
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const conversationDate = new Date(date);
    
    // If today, show time
    if (conversationDate.toDateString() === now.toDateString()) {
      return conversationDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If this year, show month and day
    if (conversationDate.getFullYear() === now.getFullYear()) {
      return conversationDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Otherwise show full date
    return conversationDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const isArabic = i18n.language === 'ar';
  
  return (
    <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4">
        <button 
          onClick={onNewConversation}
          className="mb-4 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <Plus size={16} className="mr-2" />
            <span>{isArabic ? 'محادثة جديدة' : 'New Conversation'}</span>
          </div>
        </button>
        
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isArabic ? 'ابحث في المحادثات' : 'Search conversations'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        
        <div className="mb-2 flex items-center justify-between">
          <button className="flex items-center space-x-1 text-sm font-medium text-gray-600">
            <History size={14} />
            <span>{isArabic ? 'الأخيرة' : 'Recent'}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Brain size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">{isArabic ? 'لا توجد محادثات' : 'No conversations found'}</p>
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <div key={conversation.id} className="relative">
              <button
                className={`flex w-full items-start space-x-3 rounded-md px-3 py-3 text-left hover:bg-gray-100 ${
                  activeConversationId === conversation.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <Brain size={18} className="mt-0.5 text-indigo-500" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate">{conversation.title}</p>
                  <p className="truncate text-sm text-gray-500">
                    {conversation.messages[conversation.messages.length - 1]?.content.substring(0, 40)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(conversation.updatedAt)}
                  </p>
                </div>
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(showOptions === conversation.id ? null : conversation.id);
                  }}
                >
                  <MoreVertical size={14} />
                </button>
              </button>
              
              {showOptions === conversation.id && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-2 top-10 z-10 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                        setShowOptions(null);
                      }}
                    >
                      <Trash2 size={14} className="mr-2 text-gray-500" />
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ZoneGPTSidebar;