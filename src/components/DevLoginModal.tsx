import React, { useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface DevLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DevLoginModal: React.FC<DevLoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a developer username');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create a temporary user in Supabase
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email: `${username.toLowerCase()}@dev.mydrzone.local`,
        password: 'devpassword123' // Fixed password for dev accounts
      });
      
      if (userError) {
        // If user doesn't exist, create one
        if (userError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: `${username.toLowerCase()}@dev.mydrzone.local`,
            password: 'devpassword123',
            options: {
              data: {
                is_dev_account: true,
                dev_username: username
              }
            }
          });
          
          if (signUpError) throw signUpError;
          
          // Create a profile for the new dev user
          if (signUpData.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: signUpData.user.id,
                username: username.toLowerCase(),
                full_name: `Dev User: ${username}`,
                type: 'doctor',
                specialty: 'Development',
                is_public: true
              });
              
            if (profileError) throw profileError;
            
            // Sign in with the newly created account
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: `${username.toLowerCase()}@dev.mydrzone.local`,
              password: 'devpassword123'
            });
            
            if (signInError) throw signInError;
          }
        } else {
          throw userError;
        }
      }
      
      // Redirect to MyZone
      navigate('/myzone');
      onClose();
    } catch (err) {
      console.error('Dev login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during developer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 rounded-full bg-yellow-100 p-2">
              <UserCheck size={20} className="text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold">🧪 Developer Test Login</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Developer Mode Only</p>
              <p className="mt-1">This login method is for development and testing purposes only. It bypasses email verification and creates a temporary account.</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleDevLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Developer Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter any username (e.g., dev1, tester2)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login as Developer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DevLoginModal;