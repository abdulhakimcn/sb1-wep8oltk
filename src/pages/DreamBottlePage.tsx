import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, MessageCircle, Heart } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { createDreamBottle, findMatch, updateDreamBottleStatus } from '../lib/dreamBottle';
import { motion, AnimatePresence } from 'framer-motion';
import type { DreamBottle } from '../lib/types';
import DreamBottleChat from '../components/DreamBottleChat';

const DreamBottlePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dream, setDream] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [match, setMatch] = useState<DreamBottle | null>(null);
  const [currentBottle, setCurrentBottle] = useState<DreamBottle | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dream.trim()) return;

    setLoading(true);
    try {
      // Create dream bottle
      const bottle = await createDreamBottle(dream.trim(), user.id);
      if (!bottle) throw new Error('Failed to create dream bottle');
      
      setCurrentBottle(bottle);
      setSearching(true);

      // Search for a match (15 seconds)
      setTimeout(async () => {
        try {
          const matchedBottle = await findMatch(user.id);
          
          if (matchedBottle) {
            // Update both bottles as matched
            await updateDreamBottleStatus(bottle.id, 'matched', matchedBottle.id);
            await updateDreamBottleStatus(matchedBottle.id, 'matched', bottle.id);
            setMatch(matchedBottle);
          } else {
            // No match found, mark as expired
            await updateDreamBottleStatus(bottle.id, 'expired');
          }
        } catch (error) {
          console.error('Error finding match:', error);
        } finally {
          setSearching(false);
        }
      }, 15000);
    } catch (error) {
      console.error('Error sending dream:', error);
      alert('Error sending dream. Please try again.');
      setLoading(false);
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Sparkles size={32} className="text-primary-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">قارورة الأحلام</h2>
              <p className="text-gray-600">اكتب حلمك وارمه إلى السماء... ربما يلتقي بحلم شخص آخر</p>
            </div>

            <AnimatePresence mode="wait">
              {!searching && !match ? (
                <motion.form
                  key="dream-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                >
                  <div className="mb-6">
                    <textarea
                      value={dream}
                      onChange={(e) => setDream(e.target.value)}
                      placeholder="اكتب حلمك الذي راودك البارحة أو تتمنى أن يتحقق..."
                      className="h-32 w-full resize-none rounded-lg border border-gray-300 p-4 focus:border-primary-500 focus:outline-none"
                      dir="rtl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !dream.trim()}
                    className="w-full rounded-lg bg-primary-500 py-3 text-white hover:bg-primary-600 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Send size={20} />
                      <span>أطلق القارورة نحو السماء</span>
                    </div>
                  </button>
                </motion.form>
              ) : searching ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="relative mx-auto h-32 w-32">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary-100"></div>
                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary-500">
                      <Sparkles size={48} className="text-white" />
                    </div>
                  </div>
                  <p className="mt-6 text-lg font-medium">قارورتك تطير في السماء...</p>
                  <p className="text-gray-600">تبحث عن روح قريبة منك</p>
                </motion.div>
              ) : match ? (
                <motion.div
                  key="match"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                    <Heart size={48} className="text-green-500" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">تم التقاط قارورتك!</h3>
                  <p className="mb-6 text-gray-600">
                    روح قريبة منك تشاركك نفس الحلم. هل تريد التواصل معها؟
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => navigate('/zonematch')}
                      className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                    >
                      عودة
                    </button>
                    <button
                      onClick={() => setShowChat(true)}
                      className="flex items-center space-x-2 rounded-lg bg-primary-500 px-6 py-3 font-medium text-white hover:bg-primary-600"
                    >
                      <MessageCircle size={20} />
                      <span>ابدأ المحادثة</span>
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {showChat && match && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="w-full max-w-lg">
                <DreamBottleChat
                  match={match}
                  onClose={() => {
                    setShowChat(false);
                    navigate('/chatzone');
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamBottlePage;