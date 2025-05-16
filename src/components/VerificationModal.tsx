import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { useTranslation } from 'react-i18next';

interface VerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    issuingAuthority: '',
    specialtyBoard: '',
    documentUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('verification_requests')
        .insert([{
          user_id: user.id,
          license_number: formData.licenseNumber,
          issuing_authority: formData.issuingAuthority,
          specialty_board: formData.specialtyBoard,
          document_url: formData.documentUrl,
          status: 'pending'
        }]);

      if (error) throw error;
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Error submitting verification request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('profile.verification.title')}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div>
            <p className="mb-4 text-gray-600">
              {t('profile.verification.description')}
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('profile.verification.licenseNumber')}</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{t('profile.verification.issuingAuthority')}</label>
                <input
                  type="text"
                  required
                  value={formData.issuingAuthority}
                  onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{t('profile.verification.specialtyBoard')}</label>
                <input
                  type="text"
                  value={formData.specialtyBoard}
                  onChange={(e) => setFormData({ ...formData, specialtyBoard: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
                >
                  {t('common.next')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-600">
              {t('profile.verification.uploadDocument')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <input
                  type="url"
                  required
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  placeholder={t('profile.verification.documentUrl')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {t('profile.verification.documentUrl')}
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  {t('common.back')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? t('common.submitting') : t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 font-medium">{t('profile.verification.process')}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <Check size={16} className="mr-2 text-green-500" />
              {t('profile.verification.step1')}
            </li>
            <li className="flex items-center">
              <Check size={16} className="mr-2 text-green-500" />
              {t('profile.verification.step2')}
            </li>
            <li className="flex items-center">
              <Check size={16} className="mr-2 text-green-500" />
              {t('profile.verification.step3')}
            </li>
            <li className="flex items-center">
              <Check size={16} className="mr-2 text-green-500" />
              {t('profile.verification.step4')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;