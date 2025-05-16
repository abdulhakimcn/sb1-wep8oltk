import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import slugify from 'slugify';

interface ProfileData {
  type: 'doctor' | 'organization';
  username: string;
  fullName: string;
  specialty?: string;
  organizationType?: 'hospital' | 'clinic' | 'company';
  registrationNumber?: string;
}

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    type: 'doctor',
    username: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeSelection = (type: 'doctor' | 'organization') => {
    setProfileData(prev => ({ ...prev, type }));
    setStep(2);
  };

  const generateUsername = (name: string) => {
    return slugify(name, { lower: true, strict: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: profileData.username || generateUsername(profileData.fullName),
          full_name: profileData.fullName,
          type: profileData.type,
          specialty: profileData.specialty,
        });

      if (profileError) throw profileError;

      // If organization, create organization record
      if (profileData.type === 'organization' && profileData.organizationType) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const { error: orgError } = await supabase
            .from('organizations')
            .insert({
              profile_id: profile.id,
              name: profileData.fullName,
              type: profileData.organizationType,
              registration_number: profileData.registrationNumber,
            });

          if (orgError) throw orgError;
        }
      }

      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tell us about yourself to get started
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">I am a...</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelection('doctor')}
                className="p-4 border rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <h4 className="font-medium">Doctor</h4>
                <p className="text-sm text-gray-500">Individual medical professional</p>
              </button>
              <button
                onClick={() => handleTypeSelection('organization')}
                className="p-4 border rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <h4 className="font-medium">Organization</h4>
                <p className="text-sm text-gray-500">Hospital, clinic, or company</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  {profileData.type === 'doctor' ? 'Full Name' : 'Organization Name'}
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder={generateUsername(profileData.fullName)}
                />
              </div>

              {profileData.type === 'doctor' && (
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                    Specialty
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={profileData.specialty}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialty: e.target.value }))}
                  />
                </div>
              )}

              {profileData.type === 'organization' && (
                <>
                  <div>
                    <label htmlFor="orgType" className="block text-sm font-medium text-gray-700">
                      Organization Type
                    </label>
                    <select
                      id="orgType"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={profileData.organizationType}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        organizationType: e.target.value as 'hospital' | 'clinic' | 'company'
                      }))}
                    >
                      <option value="">Select type...</option>
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="company">Medical Company</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      id="regNumber"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={profileData.registrationNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;