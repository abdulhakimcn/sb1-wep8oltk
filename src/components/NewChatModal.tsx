import React, { useState } from 'react';
import { X, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Friend {
  id: string;
  name: string;
  specialty?: string;
  avatar?: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFriend: (friend: Friend) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onSelectFriend }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock friends data
  const friends: Friend[] = [
    { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
    { id: '2', name: 'Dr. Michael Smith', specialty: 'Neurology' },
    { id: '3', name: 'Dr. Emily Chen', specialty: 'Pediatrics' },
    { id: '4', name: 'Dr. James Williams', specialty: 'Oncology' },
    { id: '5', name: 'Dr. Maria Garcia', specialty: 'Surgery' },
    { id: '6', name: 'Dr. Robert Wilson', specialty: 'Internal Medicine' },
    { id: '7', name: 'Dr. Amanda Davis', specialty: 'Dermatology' },
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
  
  if (!isOpen) return null;
  
  return (
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
            onClick={onClose}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredFriends.length > 0 ? (
              filteredFriends.map(friend => (
                <button
                  key={friend.id}
                  className="flex items-center w-full p-2 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    onSelectFriend(friend);
                    onClose();
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
              ))
            ) : (
              <div className="text-center py-4">
                <User size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No doctors found</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
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
  );
};

export default NewChatModal;