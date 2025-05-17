import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Layout from './components/Layout';
import Auth from './components/Auth';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import MyZonePage from './pages/MyZonePage';
import ZoneTubePage from './pages/ZoneTubePage';
import VideoPage from './pages/VideoPage';
import ZoneCastPage from './pages/ZoneCastPage';
import PodcastPage from './pages/PodcastPage';
import UploadMediaPage from './pages/UploadMediaPage';
import EditMediaPage from './pages/EditMediaPage';
import SearchPage from './pages/SearchPage';
import ChatZonePage from './pages/ChatZonePage';
import ZoneGBTPage from './pages/ZoneGBTPage';
import ZomZonePage from './pages/ZomZonePage';
import ResearchZonePage from './pages/ResearchZonePage';
import JobsZonePage from './pages/JobsZonePage';
import MedicalToolsPage from './pages/MedicalToolsPage';
import ZoneMatchPage from './pages/ZoneMatchPage';
import DreamBottlePage from './pages/DreamBottlePage';
import PersonalityTestPage from './pages/PersonalityTestPage';
import PersonalityResultsPage from './pages/PersonalityResultsPage';
import CaseOfTheDayPage from './pages/CaseOfTheDayPage';
import DoctorOrMythPage from './pages/DoctorOrMythPage';
import PatientSpeaksPage from './pages/PatientSpeaksPage';
import SpotTheMistakePage from './pages/SpotTheMistakePage';
import ConferenceZonePage from './pages/ConferenceZonePage';
import CreateConferencePage from './pages/CreateConferencePage';
import ProfilePage from './pages/ProfilePage';
import DevLoginPage from './pages/DevLoginPage';
import PostPage from './pages/PostPage';
import PhoneLoginPage from './pages/PhoneLoginPage';
import TourPage from './pages/TourPage';
import TestAccountPage from './pages/TestAccountPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import FindYourSpecialtyPage from './pages/FindYourSpecialtyPage';
import HelpPage from './pages/HelpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ContactPage from './pages/ContactPage';
import { supabase } from './lib/supabase';

console.log('App component loaded'); // Debug log

// Handle verification code in URL
const VerificationCodeHandler: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      console.log('Verification code detected in URL, redirecting to auth callback');
      window.location.href = `/auth/callback?code=${code}`;
    }
  }, []);

  return null;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('PrivateRoute rendering'); // Debug log
  const { user, loading } = useAuth();

  if (loading) {
    console.log('PrivateRoute: Auth is loading'); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('PrivateRoute: No user, redirecting to auth'); // Debug log
    return <Navigate to="/auth" replace />;
  }

  console.log('PrivateRoute: User authenticated, rendering children'); // Debug log
  return <>{children}</>;
};

function App() {
  console.log('App rendering'); // Debug log
  
  // Add a simple div to test if the app is rendering at all
  const renderTestDiv = (
    <div id="render-test" style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      padding: '5px 10px', 
      background: 'rgba(0,0,0,0.5)', 
      color: 'white', 
      zIndex: 9999,
      fontSize: '12px',
      borderRadius: '4px'
    }}>
      App is rendering
    </div>
  );

  // Handle verification code in URL for root component
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      console.log('Verification code detected in root component, redirecting to auth callback');
      window.location.href = `/auth/callback?code=${code}`;
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        {renderTestDiv}
        <Router>
          {/* Add the verification code handler at the root level */}
          <VerificationCodeHandler />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dev-login" element={<DevLoginPage />} />
            <Route path="/phone-login" element={<PhoneLoginPage />} />
            <Route path="/tour" element={<TourPage />} />
            <Route path="/test-account" element={<TestAccountPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/onboarding" element={
              <PrivateRoute>
                <OnboardingPage />
              </PrivateRoute>
            } />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/myzone" element={
                <PrivateRoute>
                  <MyZonePage />
                </PrivateRoute>
              } />
              
              {/* Public post page */}
              <Route path="/post/:postId" element={<PostPage />} />
              
              {/* Public zones - no login required */}
              <Route path="/zonetube" element={<ZoneTubePage />} />
              <Route path="/zonetube/videos/:videoId" element={<VideoPage />} />
              <Route path="/zonecast" element={<ZoneCastPage />} />
              <Route path="/zonecast/episodes/:podcastId" element={<PodcastPage />} />
              <Route path="/researchzone" element={<ResearchZonePage />} />
              <Route path="/medicaltools" element={<MedicalToolsPage />} />
              <Route path="/conferencezone" element={<ConferenceZonePage />} />
              
              {/* Private zones - login required */}
              <Route path="/upload-media" element={
                <PrivateRoute>
                  <UploadMediaPage />
                </PrivateRoute>
              } />
              <Route path="/edit-media/:mediaId" element={
                <PrivateRoute>
                  <EditMediaPage />
                </PrivateRoute>
              } />
              <Route path="/chatzone" element={
                <PrivateRoute>
                  <ChatZonePage />
                </PrivateRoute>
              } />
              <Route path="/zonegbt" element={
                <PrivateRoute>
                  <ZoneGBTPage />
                </PrivateRoute>
              } />
              <Route path="/zomzone" element={
                <PrivateRoute>
                  <ZomZonePage />
                </PrivateRoute>
              } />
              <Route path="/jobszone" element={<JobsZonePage />} />
              <Route path="/zonematch" element={
                <PrivateRoute>
                  <ZoneMatchPage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/dreambottle" element={
                <PrivateRoute>
                  <DreamBottlePage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/personality-test" element={
                <PrivateRoute>
                  <PersonalityTestPage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/results/:type" element={
                <PrivateRoute>
                  <PersonalityResultsPage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/case-of-the-day" element={
                <PrivateRoute>
                  <CaseOfTheDayPage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/doctor-or-myth" element={
                <PrivateRoute>
                  <DoctorOrMythPage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/patient-speaks" element={
                <PrivateRoute>
                  <PatientSpeaksPage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/spot-the-mistake" element={
                <PrivateRoute>
                  <SpotTheMistakePage />
                </PrivateRoute>
              } />
              <Route path="/zonematch/find-your-specialty" element={
                <PrivateRoute>
                  <FindYourSpecialtyPage />
                </PrivateRoute>
              } />
              <Route path="/conference/create" element={
                <PrivateRoute>
                  <CreateConferencePage />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
