import { createClient } from '@supabase/supabase-js';
import { ChatMessage, ChatRoom, Profile } from './types';
import { supabase } from './supabase';

// Simple encryption/decryption functions
const encryptMessage = (content: string): string => {
  // In production, use a proper end-to-end encryption library
  return btoa(content);
};

const decryptMessage = (content: string): string => {
  // In production, use a proper end-to-end encryption library
  return atob(content);
};

export const createDirectChat = async (otherUserId: string): Promise<ChatRoom | null> => {
  try {
    // Check if chat already exists
    const { data: existingRooms } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        participants:chat_participants(user_id)
      `)
      .eq('type', 'direct');

    const directChat = existingRooms?.find(room => 
      room.participants?.length === 2 &&
      room.participants.some(p => p.user_id === otherUserId)
    );

    if (directChat) {
      return directChat;
    }

    // Create new direct chat
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        type: 'direct',
        created_by: supabase.auth.getUser().then(({ data }) => data.user?.id)
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add participants
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { room_id: room.id, user_id: supabase.auth.getUser().then(({ data }) => data.user?.id) },
        { room_id: room.id, user_id: otherUserId }
      ]);

    if (participantsError) throw participantsError;

    return room;
  } catch (error) {
    console.error('Error creating direct chat:', error);
    return null;
  }
};

export const createGroupChat = async (name: string, participantIds: string[]): Promise<ChatRoom | null> => {
  try {
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        type: 'group',
        name,
        created_by: supabase.auth.getUser().then(({ data }) => data.user?.id)
      })
      .select()
      .single();

    if (roomError) throw roomError;

    const participants = participantIds.map(userId => ({
      room_id: room.id,
      user_id: userId,
      role: userId === supabase.auth.getUser().then(({ data }) => data.user?.id) ? 'admin' : 'member'
    }));

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participants);

    if (participantsError) throw participantsError;

    return room;
  } catch (error) {
    console.error('Error creating group chat:', error);
    return null;
  }
};

export const sendMessage = async (
  roomId: string,
  content: string,
  type: 'text' | 'file' | 'image' | 'voice' = 'text',
  attachment?: File
): Promise<ChatMessage | null> => {
  try {
    const encryptedContent = encryptMessage(content);

    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: supabase.auth.getUser().then(({ data }) => data.user?.id),
        content: encryptedContent,
        type,
        is_encrypted: true
      })
      .select()
      .single();

    if (messageError) throw messageError;

    if (attachment && message) {
      const fileName = `${roomId}/${message.id}/${attachment.name}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, attachment);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      const { error: attachmentError } = await supabase
        .from('chat_attachments')
        .insert({
          message_id: message.id,
          file_name: attachment.name,
          file_type: attachment.type,
          file_size: attachment.size,
          file_url: publicUrl
        });

      if (attachmentError) throw attachmentError;
    }

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const subscribeToRoom = (
  roomId: string,
  callback: (message: ChatMessage) => void
) => {
  return supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        const message = payload.new as ChatMessage;
        message.content = decryptMessage(message.content);
        callback(message);
      }
    )
    .subscribe();
};

export const markRoomAsRead = async (roomId: string) => {
  try {
    const { error } = await supabase
      .from('chat_participants')
      .update({
        unread_count: 0,
        last_read_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .eq('user_id', supabase.auth.getUser().then(({ data }) => data.user?.id));

    if (error) throw error;
  } catch (error) {
    console.error('Error marking room as read:', error);
  }
};