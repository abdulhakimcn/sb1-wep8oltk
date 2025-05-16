import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { DreamBottle } from '../lib/types';

interface DreamBottleChatProps {
  match: DreamBottle;
  onClose: () => void;
}

const DreamBottleChat: React.FC<DreamBottleChatProps> = ({ match, onClose }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!user || !message.trim()) return;
    
    setSending(true);
    try {
      // Create chat room if it doesn't exist
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          type: 'direct',
          created_by: user.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { room_id: room.id, user_id: user.id },
          { room_id: room.id, user_id: match.user_id }
        ]);

      if (participantsError) throw participantsError;

      // Send message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          sender_id: user.id,
          content: message.trim(),
          type: 'text'
        });

      if (messageError) throw messageError;

      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Send a Message</h3>
        <p className="text-sm text-gray-600">
          Start a conversation with your dream match
        </p>
      </div>

      <div className="mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          className="h-32 w-full resize-none rounded-lg border border-gray-300 p-4 focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="flex items-center space-x-2 rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
        >
          <Send size={18} />
          <span>{sending ? 'Sending...' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
};

export default DreamBottleChat;