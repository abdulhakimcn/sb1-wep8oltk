import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { useTranslation } from 'react-i18next';
import slugify from 'slugify';
import { Crown, Building, User } from 'lucide-react';

interface ProfileData {
  type: 'doctor' | 'organization';
  username: string;
  fullName: string;
  specialty?: string;
  organizationType?: 'hospital' | 'clinic' | 'company' | 'pharma' | 'research' | 'other';
  registrationNumber?: string;
  country?: string;
}

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    type: 'doctor',
    username: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (data && !error) {
          // User already has a profile, redirect to MyZone
          navigate('/myzone');
        } else {
          // Check if user has account type in metadata
          const { data: userData } = await supabase.auth.getUser();
          const accountType = userData.user?.user_metadata?.account_type as 'doctor' | 'organization';
          const orgName = userData.user?.user_metadata?.org_name;
          const orgType = userData.user?.user_metadata?.org_type;
          const orgCountry = userData.user?.user_metadata?.org_country;
          
          if (accountType) {
            setProfileData(prev => ({ 
              ...prev, 
              type: accountType,
              ...(orgName && { fullName: orgName }),
              ...(orgType && { organizationType: orgType as any }),
              ...(orgCountry && { country: orgCountry })
            }));
          }
        }
      } catch (error) {
        // No profile exists, continue with onboarding
        console.log('No existing profile found, continuing with onboarding');
      }
    };
    
    checkExistingProfile();
  }, [user, navigate]);

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
          is_public: true // Make profile public by default
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
              country: profileData.country
            });

          if (orgError) throw orgError;
        }
      }

      navigate('/myzone');
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
          <div className="flex justify-center items-center mb-4">
            <Crown size={32} className="text-primary-500 mr-2" />
            <h2 className="text-3xl font-extrabold text-gray-900">{t('onboarding.completeProfile')}</h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {t('onboarding.tellAboutYourself')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">{t('onboarding.iAmA')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelection('doctor')}
                className="p-4 border rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <div className="flex justify-center mb-3">
                  <User size={24} className="text-primary-500" />
                </div>
                <h4 className="font-medium">{t('onboarding.doctor')}</h4>
                <p className="text-sm text-gray-500">{t('onboarding.individualMedical')}</p>
              </button>
              <button
                onClick={() => handleTypeSelection('organization')}
                className="p-4 border rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <div className="flex justify-center mb-3">
                  <Building size={24} className="text-primary-500" />
                </div>
                <h4 className="font-medium">{t('onboarding.organization')}</h4>
                <p className="text-sm text-gray-500">{t('onboarding.hospitalClinic')}</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  {profileData.type === 'doctor' ? t('onboarding.fullName') : t('onboarding.organizationName')}
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
                  {t('onboarding.username')}
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
                    {t('onboarding.specialty')}
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
                      {t('onboarding.organizationType')}
                    </label>
                    <select
                      id="orgType"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={profileData.organizationType}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        organizationType: e.target.value as any
                      }))}
                    >
                      <option value="">{t('onboarding.selectType')}</option>
                      <option value="hospital">{t('onboarding.hospital')}</option>
                      <option value="clinic">{t('onboarding.clinic')}</option>
                      <option value="pharma">Pharmaceutical Company</option>
                      <option value="research">Research Center</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700">
                      {t('onboarding.registrationNumber')}
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
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={profileData.country}
                      onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
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
                {t('common.back')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? t('onboarding.creatingProfile') : t('onboarding.completeSetup')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;