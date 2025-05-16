import { supabase } from './supabase';
import type { DreamBottle } from './types';

export const createDreamBottle = async (content: string, userId: string): Promise<DreamBottle | null> => {
  try {
    const { data, error } = await supabase
      .from('dream_bottles')
      .insert([{
        user_id: userId,
        content: content.trim(),
        status: 'active'
      }])
      .select(`
        *,
        profile:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating dream bottle:', error);
    return null;
  }
};

export const findMatch = async (userId: string): Promise<DreamBottle | null> => {
  try {
    // Find a recent active dream bottle from another user
    const { data, error } = await supabase
      .from('dream_bottles')
      .select(`
        *,
        profile:profiles(*)
      `)
      .neq('user_id', userId)
      .eq('status', 'active')
      .gt('timestamp', new Date(Date.now() - 5000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error finding match:', error);
    return null;
  }
};

export const updateDreamBottleStatus = async (bottleId: string, status: 'matched' | 'expired', matchedWith?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dream_bottles')
      .update({
        status,
        matched_with: matchedWith
      })
      .eq('id', bottleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating dream bottle status:', error);
    return false;
  }
};