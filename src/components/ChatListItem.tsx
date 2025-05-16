import React from 'react';

interface ChatListItemProps {
  id: string;
  name: string;
  specialty?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  lastMessage?: string;
  unreadCount?: number;
  isSelected: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  name,
  specialty,
  avatar,
  status,
  lastSeen,
  lastMessage,
  unreadCount,
  isSelected,
  onClick
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <button
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="relative">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">
                {getInitials(name)}
              </span>
            </div>
          )}
          {status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{name}</p>
          <div className="flex items-center text-xs text-gray-500">
            {specialty ? (
              <span className="truncate">{specialty}</span>
            ) : lastMessage ? (
              <span className="truncate">{lastMessage}</span>
            ) : (
              <span>Last seen {lastSeen}</span>
            )}
          </div>
        </div>
        {unreadCount && unreadCount > 0 && (
          <div className="ml-2 bg-primary-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </div>
    </button>
  );
};

export default ChatListItem;