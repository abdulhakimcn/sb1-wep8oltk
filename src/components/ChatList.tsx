import React, { useState } from 'react';
import { MessageCircle, Search, Plus, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Friend {
  id: string;
  name: string;
  specialty?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  unreadCount?: number;
}

interface ChatListProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriendId?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectFriend, selectedFriendId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  // Mock friends data
  const friends: Friend[] = [
    { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', status: 'online' },
    { id: '2', name: 'Dr. Michael Smith', status: 'offline', lastSeen: '1h ago' },
    { id: '3', name: 'Dr. Emily Chen', status: 'offline', lastSeen: '3h ago' },
    { id: '4', name: 'Dr. James Williams', status: 'offline', lastSeen: '6h ago' },
    { id: '5', name: 'Dr. Maria Garcia', status: 'offline', lastSeen: '1d ago' },
    { id: '6', name: 'Dr. Robert Wilson', status: 'offline', lastSeen: '1d ago' },
    { id: '7', name: 'Dr. Amanda Davis', status: 'offline', lastSeen: '2d ago' },
  ];
  
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.specialty && friend.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Friends</h2>
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
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => (
            <button
              key={friend.id}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedFriendId === friend.id ? 'bg-primary-50' : ''}`}
              onClick={() => onSelectFriend(friend)}
            >
              <div className="flex items-center">
                <div className="relative">
                  {friend.avatar ? (
                    <img 
                      src={friend.avatar} 
                      alt={friend.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600">
                        {getInitials(friend.name)}
                      </span>
                    </div>
                  )}
                  {friend.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{friend.name}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    {friend.specialty ? (
                      <span>{friend.specialty}</span>
                    ) : (
                      <>
                        <span>Last seen {friend.lastSeen}</span>
                      </>
                    )}
                  </div>
                </div>
                {friend.unreadCount && friend.unreadCount > 0 && (
                  <div className="ml-auto bg-primary-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {friend.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 px-4">
            <User size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No friends found</p>
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              Add new contact
            </button>
          </div>
        )}
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
                <h3 className="text-lg font-semibold">New Chat</h3>
                <button 
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search for doctors
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or specialty..."
                    className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {friends.map(friend => (
                    <button
                      key={friend.id}
                      className="flex items-center w-full p-2 rounded-md hover:bg-gray-50"
                      onClick={() => {
                        onSelectFriend(friend);
                        setShowNewChatModal(false);
                      }}
                    >
                      {friend.avatar ? (
                        <img 
                          src={friend.avatar} 
                          alt={friend.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {getInitials(friend.name)}
                          </span>
                        </div>
                      )}
                      <div className="ml-3 text-left">
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-xs text-gray-500">{friend.specialty || 'Medical Professional'}</p>
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
                  Cancel
                </button>
                <button className="btn-primary">
                  Start Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatList;