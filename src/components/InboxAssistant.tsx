import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, MoreVertical, RefreshCw, Bot, ThumbsUp, ThumbsDown, Sparkles, Copy, Check } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import KimsoulLogo from './KimsoulLogo';
import { getKimsoulResponse } from '../services/openai';
import { useTranslation } from 'react-i18next';

interface ExternalMessage {
  id: string;
  content: string;
  timestamp: Date;
  source: 'whatsapp' | 'telegram' | 'wechat';
  sender: {
    name: string;
    phone?: string;
    id: string;
  };
  isRead: boolean;
}

interface InboxAssistantProps {
  onClose: () => void;
}

const InboxAssistant: React.FC<InboxAssistantProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ExternalMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ExternalMessage | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [aiSuggestedReply, setAiSuggestedReply] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch external messages
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll use mock data
    const mockMessages: ExternalMessage[] = [
      {
        id: '1',
        content: "Hello Dr. Ahmed, I've been having severe headaches for the past 3 days. Should I be concerned?",
        timestamp: new Date(Date.now() - 3600000 * 2),
        source: 'whatsapp',
        sender: {
          name: 'John Smith',
          phone: '+1234567890',
          id: 'john_smith'
        },
        isRead: false
      },
      {
        id: '2',
        content: "Good morning doctor, this is Maria from yesterday's appointment. The new medication seems to be working well, but I'm experiencing some dizziness. Is this normal?",
        timestamp: new Date(Date.now() - 3600000 * 5),
        source: 'telegram',
        sender: {
          name: 'Maria Garcia',
          id: 'maria_garcia'
        },
        isRead: true
      },
      {
        id: '3',
        content: "Dr. Ahmed, my son's fever has gone down after taking the medicine you prescribed. Thank you so much for your help!",
        timestamp: new Date(Date.now() - 3600000 * 24),
        source: 'whatsapp',
        sender: {
          name: 'Sarah Johnson',
          phone: '+9876543210',
          id: 'sarah_johnson'
        },
        isRead: true
      }
    ];
    
    setMessages(mockMessages);
    setLoading(false);
  }, []);

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    setIsReplying(true);
    
    // In a real implementation, this would send to the appropriate API
    setTimeout(() => {
      // Update the messages list to show the conversation
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, isRead: true } 
          : msg
      );
      
      setMessages(updatedMessages);
      setReplyText('');
      setAiSuggestedReply('');
      setIsReplying(false);
      
      // Show success notification
      alert(`Reply sent to ${selectedMessage.sender.name} via ${selectedMessage.source}`);
    }, 1000);
  };

  const handleAskKimsoul = async () => {
    if (!selectedMessage) return;
    
    setIsGeneratingReply(true);
    
    try {
      // Prepare prompt for Kimsoul
      const prompt = `
I received this message from a patient: "${selectedMessage.content}"

Please help me write a professional, empathetic, and helpful response. Keep it concise and appropriate for ${selectedMessage.source}.
`;
      
      // Get AI response
      const response = await getKimsoulResponse([
        { id: '1', role: 'user', content: prompt, timestamp: new Date() }
      ]);
      
      setAiSuggestedReply(response);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestedReply("I'm sorry, I couldn't generate a reply at this time. Please try again.");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleUseAiReply = () => {
    setReplyText(aiSuggestedReply);
  };

  const handleCopyAiReply = () => {
    navigator.clipboard.writeText(aiSuggestedReply);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSourceLabel = (source: string) => {
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <MessageCircle size={20} className="text-primary-600" />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold">{t('chat.inboxAssistant')}</h3>
            <p className="text-xs text-gray-500">{t('chat.externalMessages')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <RefreshCw size={18} />
          </button>
          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Messages List */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            messages.map(message => (
              <button
                key={message.id}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-100 transition-colors ${
                  selectedMessage?.id === message.id ? 'bg-primary-50' : ''
                } ${!message.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      message.source === 'whatsapp' ? 'bg-green-100 text-green-800' :
                      message.source === 'telegram' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      [{formatSourceLabel(message.source)}]
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
                <p className="font-medium text-sm">{message.sender.name}</p>
                <p className="text-xs text-gray-500 truncate">{message.content}</p>
              </button>
            ))
          )}
        </div>
        
        {/* Conversation View */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedMessage ? (
            <>
              {/* Message Details */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      selectedMessage.source === 'whatsapp' ? 'bg-green-100 text-green-800' :
                      selectedMessage.source === 'telegram' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      [{formatSourceLabel(selectedMessage.source)}]
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{selectedMessage.timestamp.toLocaleString()}</span>
                </div>
                <h3 className="font-medium">{selectedMessage.sender.name}</h3>
                {selectedMessage.sender.phone && (
                  <p className="text-xs text-gray-500">{selectedMessage.sender.phone}</p>
                )}
              </div>
              
              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="flex mb-4">
                  <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-lg bg-white border border-gray-200 p-3 text-gray-800">
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>
                
                {aiSuggestedReply && (
                  <div className="mb-4">
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <div className="flex items-center mb-2">
                        <KimsoulLogo size={24} className="mr-2" />
                        <div>
                          <p className="text-sm font-medium text-indigo-700">{t('chat.kimsoulSuggestion')}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{aiSuggestedReply}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleUseAiReply}
                            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center"
                          >
                            <ThumbsUp size={12} className="mr-1" />
                            {t('chat.useReply')}
                          </button>
                          <button 
                            onClick={() => setAiSuggestedReply('')}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center"
                          >
                            <ThumbsDown size={12} className="mr-1" />
                            {t('chat.discardReply')}
                          </button>
                        </div>
                        <button 
                          onClick={handleCopyAiReply}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} className="mr-1" />
                              {t('common.copied')}
                            </>
                          ) : (
                            <>
                              <Copy size={12} className="mr-1" />
                              {t('common.copy')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reply Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center mb-2 justify-between">
                  <p className="text-sm font-medium">{t('chat.replyTo')} {selectedMessage.sender.name}</p>
                  <button
                    onClick={handleAskKimsoul}
                    disabled={isGeneratingReply}
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center"
                  >
                    {isGeneratingReply ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-indigo-700 mr-1"></div>
                        {t('chat.generating')}
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} className="mr-1" />
                        {t('chat.askKimsoulHelp')}
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('chat.typeReply')}
                    className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-20"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isReplying}
                    className="rounded-r-lg bg-primary-500 p-2 h-20 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReplying ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('chat.inboxAssistantTitle')}</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                {t('chat.inboxAssistantDescription')}
              </p>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {t('chat.selectMessagePrompt')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxAssistant;