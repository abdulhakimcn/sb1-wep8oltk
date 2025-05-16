import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Search, Plus, Send, Phone, Video, Info, MoreVertical, User, Users, Inbox } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import InboxAssistant from '../components/InboxAssistant';

interface Friend {
  id: string;
  full_name: string;
  specialty?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away';
  last_seen?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: Date;
  is_read: boolean;
}

const ChatZonePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showInboxAssistant, setShowInboxAssistant] = useState(false);
  const [unreadInboxCount, setUnreadInboxCount] = useState(2); // Mock unread count

  useEffect(() => {
    fetchFriends();
  }, [user]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.id);
    }
  }, [selectedFriend]);

  useEffect(() => {
    // Filter friends based on search term
    const filtered = friends.filter(friend => 
      friend.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (friend.specialty && friend.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredFriends(filtered);
  }, [searchTerm, friends]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the database
      // For now, we'll use mock data
      const mockFriends: Friend[] = [
        { id: '1', full_name: 'Dr. Sarah Johnson', specialty: 'Cardiology', status: 'online' },
        { id: '2', full_name: 'Dr. Michael Smith', status: 'offline', last_seen: '1h ago' },
        { id: '3', full_name: 'Dr. Emily Chen', status: 'offline', last_seen: '3h ago' },
        { id: '4', full_name: 'Dr. James Williams', status: 'offline', last_seen: '6h ago' },
        { id: '5', full_name: 'Dr. Maria Garcia', status: 'offline', last_seen: '1d ago' },
        { id: '6', full_name: 'Dr. Robert Wilson', status: 'offline', last_seen: '1d ago' },
        { id: '7', full_name: 'Dr. Amanda Davis', status: 'offline', last_seen: '2d ago' },
      ];
      
      setFriends(mockFriends);
      setFilteredFriends(mockFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (friendId: string) => {
    try {
      // In a real app, this would fetch from the database
      // For now, we'll use mock data if the friend is selected
      if (friendId === '1') {
        const mockMessages: Message[] = [
          { id: '1', sender_id: '1', content: 'Hello! How are you doing today?', timestamp: new Date(Date.now() - 3600000), is_read: true },
          { id: '2', sender_id: user?.id || 'current', content: 'I\'m doing well, thanks for asking! How about you?', timestamp: new Date(Date.now() - 3500000), is_read: true },
          { id: '3', sender_id: '1', content: 'Great! I wanted to discuss a patient case with you.', timestamp: new Date(Date.now() - 3400000), is_read: true },
          { id: '4', sender_id: user?.id || 'current', content: 'Sure, I\'d be happy to help. What\'s the case?', timestamp: new Date(Date.now() - 3300000), is_read: true },
        ];
        setMessages(mockMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender_id: user?.id || 'current',
      content: newMessage.trim(),
      timestamp: new Date(),
      is_read: false
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenInboxAssistant = () => {
    setShowInboxAssistant(true);
    setSelectedFriend(null);
    setUnreadInboxCount(0); // Mark as read when opened
  };

  return (
    <>
      <Helmet>
        <title>ChatZone - Secure Messaging | Dr.Zone</title>
        <meta name="description" content="Secure messaging platform for medical professionals to communicate and collaborate." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('chat.title')}</h1>
            <p className="text-gray-600">{t('chat.subtitle')}</p>
          </div>
          
          <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-lg shadow-md">
            {/* Friends List */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{t('chat.friends')}</h2>
                  <button 
                    onClick={() => setShowNewChatModal(true)}
                    className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder={t('chat.searchDoctors')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {/* Inbox Assistant Button - Always at the top */}
                <button
                  className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors bg-blue-50"
                  onClick={handleOpenInboxAssistant}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Inbox size={18} className="text-blue-600" />
                      </div>
                      {unreadInboxCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadInboxCount}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{t('chat.inboxAssistant')}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{t('chat.externalMessages')}</span>
                      </div>
                    </div>
                  </div>
                </button>
                
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : filteredFriends.length > 0 ? (
                  filteredFriends.map(friend => (
                    <button
                      key={friend.id}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedFriend?.id === friend.id ? 'bg-primary-50' : ''}`}
                      onClick={() => {
                        setSelectedFriend(friend);
                        setShowInboxAssistant(false);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          {friend.avatar_url ? (
                            <img 
                              src={friend.avatar_url} 
                              alt={friend.full_name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-600">
                                {getInitials(friend.full_name)}
                              </span>
                            </div>
                          )}
                          {friend.status === 'online' && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{friend.full_name}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            {friend.specialty ? (
                              <span>{friend.specialty}</span>
                            ) : (
                              <>
                                <span>{t('chat.lastSeen')} {friend.last_seen}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 px-4">
                    <Users size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{t('chat.noFriends')}</p>
                    <button 
                      onClick={() => setShowNewChatModal(true)}
                      className="mt-2 text-sm text-primary-600 hover:underline"
                    >
                      {t('chat.addContact')}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              {showInboxAssistant ? (
                <InboxAssistant onClose={() => setShowInboxAssistant(false)} />
              ) : selectedFriend ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      {selectedFriend.avatar_url ? (
                        <img 
                          src={selectedFriend.avatar_url} 
                          alt={selectedFriend.full_name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {getInitials(selectedFriend.full_name)}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium">{selectedFriend.full_name}</p>
                        <div className="flex items-center text-xs">
                          <span className={`w-2 h-2 rounded-full ${selectedFriend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} mr-1`}></span>
                          <span className="text-gray-500">{selectedFriend.status === 'online' ? t('chat.online') : `${t('chat.lastSeen')} ${selectedFriend.last_seen}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                        <Phone size={18} />
                      </button>
                      <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                        <Video size={18} />
                      </button>
                      <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                        <Info size={18} />
                      </button>
                      <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-4">
                      {messages.length > 0 ? (
                        messages.map(message => (
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
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_id === user?.id || message.sender_id === 'current'
                                  ? 'text-primary-100'
                                  : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500">{t('chat.noMessages')}</p>
                          <p className="text-sm text-gray-400">{t('chat.startConversation')} {selectedFriend.full_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('chat.typeMessage')}
                        className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="rounded-r-lg bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8 max-w-md">
                    <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle size={32} className="text-primary-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('chat.noMessages')}</h3>
                    <p className="text-gray-600 mb-6">
                      {t('chat.selectFriendPrompt')}
                    </p>
                    <button 
                      onClick={() => setShowNewChatModal(true)}
                      className="btn-primary"
                    >
                      <Plus size={18} className="mr-2" />
                      {t('chat.newChat')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('chat.newChat')}</h3>
                <button 
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('chat.searchDoctors')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={t('chat.searchByNameOrSpecialty')}
                    className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('chat.suggested')}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {friends.map(friend => (
                    <button
                      key={friend.id}
                      className="flex items-center w-full p-2 rounded-md hover:bg-gray-50"
                      onClick={() => {
                        setSelectedFriend(friend);
                        setShowNewChatModal(false);
                        setShowInboxAssistant(false);
                      }}
                    >
                      {friend.avatar_url ? (
                        <img 
                          src={friend.avatar_url} 
                          alt={friend.full_name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {getInitials(friend.full_name)}
                          </span>
                        </div>
                      )}
                      <div className="ml-3 text-left">
                        <p className="font-medium">{friend.full_name}</p>
                        <p className="text-xs text-gray-500">{friend.specialty || t('chat.medicalProfessional')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="btn-outline mr-2"
                >
                  {t('common.cancel')}
                </button>
                <button className="btn-primary">
                  {t('chat.startChat')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatZonePage;