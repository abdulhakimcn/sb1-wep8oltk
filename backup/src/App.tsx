import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Layout from './components/Layout';
import Auth from './components/Auth';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import MyZonePage from './pages/MyZonePage';
import ZoneTubePage from './pages/ZoneTubePage';
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
import ConferenceZonePage from './pages/ConferenceZonePage';
import CreateConferencePage from './pages/CreateConferencePage';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={
              <PrivateRoute>
                <OnboardingPage />
              </PrivateRoute>
            } />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/myzone" element={
                <PrivateRoute>
                  <MyZonePage />
                </PrivateRoute>
              } />
              <Route path="/zonetube" element={<ZoneTubePage />} />
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
              <Route path="/researchzone" element={<ResearchZonePage />} />
              <Route path="/jobszone" element={<JobsZonePage />} />
              <Route path="/medicaltools" element={<MedicalToolsPage />} />
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
              <Route path="/conferencezone" element={<ConferenceZonePage />} />
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