import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  type: 'doctor' | 'organization';
  specialty?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: Record<string, string>;
  education?: any[];
  experience?: any[];
  publications?: any[];
  languages?: string[];
  is_public: boolean;
  is_verified?: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SoulTestQuestion {
  question: string;
  options: {
    text: string;
    value: string;
  }[];
}

export interface SoulTestResult {
  type: string;
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  idealSpecialties: string[];
}

export interface DreamBottle {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  matched_with?: string;
  status: 'active' | 'matched' | 'expired';
  profile?: Profile;
}

export interface Video {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url: string;
  duration?: string;
  price: number;
  is_premium: boolean;
  views_count: number;
  likes_count?: number;
  comments_count?: number;
  category?: 'medical' | 'scientific' | 'documentary' | 'entertainment' | 'music';
  quality_options?: string[];
  tags?: string[];
  language: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  has_purchased?: boolean;
  status?: string;
  file_url?: string;
}

export interface VideoPurchase {
  id: string;
  video_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  profile_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  is_liked?: boolean;
  specialty?: string;
  language?: string;
  privacy?: 'public' | 'users' | 'connections';
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail_url?: string;
  duration: string;
  specialty?: string;
  transcript?: string;
  show_notes?: string;
  host_id: string;
  host?: Profile;
  likes_count?: number;
  plays_count?: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
  status?: string;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'file';
  name: string;
  size: number;
  created_at: string;
  user_id: string;
}