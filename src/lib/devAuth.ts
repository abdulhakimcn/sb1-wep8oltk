import { supabase, isValidEmailDomain } from './supabase';

/**
 * Creates a developer test account for quick login without email verification
 * This should only be used in development environments
 */
export const createDevAccount = async (username: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Normalize username
    const normalizedUsername = username.toLowerCase().trim();
    
    // Create a deterministic email from the username
    const email = `${normalizedUsername}@dev.mydrzone.local`;
    
    // Fixed password for all dev accounts
    const password = 'devpassword123';
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // If user exists, just return success
    if (existingUser.user) {
      return { success: true };
    }
    
    // Create new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          is_dev_account: true,
          dev_username: normalizedUsername
        }
      }
    });
    
    if (error) throw error;
    
    // Create a profile for the new dev user
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          username: normalizedUsername,
          full_name: `Dev User: ${normalizedUsername}`,
          type: 'doctor',
          specialty: 'Development',
          is_public: true
        });
        
      if (profileError) throw profileError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating dev account:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating dev account'
    };
  }
};

/**
 * Login with a developer test account
 */
export const loginWithDevAccount = async (username: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Normalize username
    const normalizedUsername = username.toLowerCase().trim();
    
    // Create a deterministic email from the username
    const email = `${normalizedUsername}@dev.mydrzone.local`;
    
    // Fixed password for all dev accounts
    const password = 'devpassword123';
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // If user doesn't exist, create one
      if (error.message.includes('Invalid login credentials')) {
        return await createDevAccount(normalizedUsername);
      }
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error logging in with dev account:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error logging in with dev account'
    };
  }
};

/**
 * Check if the current user is a dev account
 */
export const isDevAccount = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.user_metadata?.is_dev_account === true;
  } catch (error) {
    console.error('Error checking if dev account:', error);
    return false;
  }
};

/**
 * Validate if an email is from an allowed domain
 */
export const validateEmailDomain = (email: string): boolean => {
  return isValidEmailDomain(email);
};