import { supabase } from './supabase';

export interface MediaUploadData {
  title: string;
  description: string;
  type: 'video' | 'podcast';
  fileUrl: string;
  thumbnailUrl?: string;
  duration: string;
  category?: string;
  specialty?: string;
  language: string;
  isPremium?: boolean;
  price?: number;
  tags?: string[];
  transcript?: string;
  showNotes?: string;
}

export interface Media {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'podcast';
  file_url: string;
  thumbnail_url?: string;
  duration: string;
  category?: string;
  specialty?: string;
  language: string;
  is_premium: boolean;
  price: number;
  tags?: string[];
  transcript?: string;
  show_notes?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  creator_id: string;
  creator?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  file: File,
  bucket: string,
  path: string = ''
): Promise<string | null> => {
  try {
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Upload media (video or podcast) to the database
 */
export const uploadMedia = async (
  creatorId: string,
  data: MediaUploadData
): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    const { data: result, error } = await supabase
      .from('media')
      .insert([{
        title: data.title,
        description: data.description,
        type: data.type,
        file_url: data.fileUrl,
        thumbnail_url: data.thumbnailUrl,
        duration: data.duration,
        category: data.type === 'video' ? data.category : undefined,
        specialty: data.type === 'podcast' ? data.specialty : undefined,
        language: data.language,
        is_premium: data.isPremium || false,
        price: data.isPremium ? data.price : 0,
        tags: data.tags || [],
        transcript: data.transcript,
        show_notes: data.showNotes,
        creator_id: creatorId
      }])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error uploading media:', error);
    return { success: false, error };
  }
};

/**
 * Get media by ID
 */
export const getMediaById = async (id: string): Promise<Media | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select(`
        *,
        creator:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching media:', error);
    return null;
  }
};

/**
 * Get media by type (video or podcast)
 */
export const getMediaByType = async (
  type: 'video' | 'podcast', 
  options: {
    limit?: number;
    category?: string;
    specialty?: string;
    language?: string;
  } = {}
): Promise<Media[]> => {
  try {
    let query = supabase
      .from('media')
      .select(`
        *,
        creator:profiles(*)
      `)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (type === 'video' && options.category && options.category !== 'all') {
      query = query.eq('category', options.category);
    }

    if (type === 'podcast' && options.specialty && options.specialty !== 'all') {
      query = query.eq('specialty', options.specialty);
    }

    if (options.language && options.language !== 'all') {
      query = query.eq('language', options.language);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return [];
  }
};

/**
 * Search media by query
 */
export const searchMedia = async (
  query: string,
  options: {
    type?: 'video' | 'podcast';
    limit?: number;
  } = {}
): Promise<Media[]> => {
  try {
    let dbQuery = supabase
      .from('media')
      .select(`
        *,
        creator:profiles(*)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (options.type) {
      dbQuery = dbQuery.eq('type', options.type);
    }

    if (options.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching media:', error);
    return [];
  }
};

/**
 * Increment media views
 */
export const incrementMediaViews = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('increment_media_views_rpc', { id });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return false;
  }
};

/**
 * Toggle like on media
 */
export const toggleMediaLike = async (
  mediaId: string, 
  userId: string
): Promise<{ liked: boolean; error?: any }> => {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('media_likes')
      .select('id')
      .eq('media_id', mediaId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingLike) {
      // Unlike
      const { error: unlikeError } = await supabase
        .from('media_likes')
        .delete()
        .eq('id', existingLike.id);

      if (unlikeError) throw unlikeError;
      return { liked: false };
    } else {
      // Like
      const { error: likeError } = await supabase
        .from('media_likes')
        .insert([{ media_id: mediaId, user_id: userId }]);

      if (likeError) throw likeError;
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { liked: false, error };
  }
};

/**
 * Add comment to media
 */
export const addMediaComment = async (
  mediaId: string, 
  userId: string, 
  content: string
): Promise<{ success: boolean; comment?: any; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('media_comments')
      .insert([{ media_id: mediaId, user_id: userId, content }])
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) throw error;
    return { success: true, comment: data };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error };
  }
};

/**
 * Get comments for media
 */
export const getMediaComments = async (mediaId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('media_comments')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

/**
 * Get related media
 */
export const getRelatedMedia = async (
  id: string,
  type: 'video' | 'podcast',
  category?: string,
  specialty?: string,
  limit: number = 4
): Promise<Media[]> => {
  try {
    let query = supabase
      .from('media')
      .select(`
        *,
        creator:profiles(*)
      `)
      .eq('type', type)
      .neq('id', id)
      .limit(limit);

    if (type === 'video' && category) {
      query = query.eq('category', category);
    }

    if (type === 'podcast' && specialty) {
      query = query.eq('specialty', specialty);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching related media:', error);
    return [];
  }
};