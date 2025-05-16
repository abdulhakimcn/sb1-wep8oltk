/*
  # Chat System Tables

  1. New Tables
    - `chat_rooms`
      - For both direct messages and group chats
      - Stores room metadata and type (direct/group)
    
    - `chat_participants`
      - Links users to chat rooms
      - Tracks unread messages
    
    - `chat_messages`
      - Stores encrypted messages
      - Supports text, files, and images
    
    - `chat_attachments`
      - Stores metadata for shared files/images

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('direct', 'group')),
  name text, -- For group chats
  created_by uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb -- For additional room settings
);

-- Create chat_participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  unread_count integer DEFAULT 0,
  last_read_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  role text DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  UNIQUE(room_id, user_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content text NOT NULL, -- Encrypted content
  type text DEFAULT 'text' CHECK (type IN ('text', 'file', 'image', 'voice')),
  metadata jsonb DEFAULT '{}'::jsonb, -- For message-specific data
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_encrypted boolean DEFAULT true
);

-- Create chat_attachments table
CREATE TABLE IF NOT EXISTS chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES chat_messages ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.room_id = chat_rooms.id
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Chat participants policies
CREATE POLICY "Users can view participants in their rooms"
  ON chat_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants AS my_rooms
      WHERE my_rooms.room_id = chat_participants.room_id
      AND my_rooms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms they're invited to"
  ON chat_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.room_id = NEW.room_id
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.role = 'admin'
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view messages in their rooms"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.room_id = chat_messages.room_id
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their rooms"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.room_id = NEW.room_id
      AND chat_participants.user_id = auth.uid()
    )
  );

-- Chat attachments policies
CREATE POLICY "Users can view attachments in their rooms"
  ON chat_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_messages
      JOIN chat_participants ON chat_messages.room_id = chat_participants.room_id
      WHERE chat_messages.id = chat_attachments.message_id
      AND chat_participants.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX chat_rooms_updated_at_idx ON chat_rooms(updated_at DESC);
CREATE INDEX chat_participants_user_id_idx ON chat_participants(user_id);
CREATE INDEX chat_messages_room_id_idx ON chat_messages(room_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at DESC);

-- Create function to update room's last_message_at
CREATE OR REPLACE FUNCTION update_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating room's last_message_at
CREATE TRIGGER update_room_last_message_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_room_last_message();

-- Create function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_messages()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_participants
  SET unread_count = unread_count + 1
  WHERE room_id = NEW.room_id
    AND user_id != NEW.sender_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for incrementing unread count
CREATE TRIGGER increment_unread_messages_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_messages();