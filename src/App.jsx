import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Loader from './components/Loader';
import ProtectedRoute from './routes/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { ToastProvider } from './context/ToastContext';

// Code-split pages and heavy modals via React.lazy
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetailsPage = lazy(() => import('./pages/JobDetailsPage'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Applications = lazy(() => import('./pages/Applications'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SavedJobs = lazy(() => import('./pages/SavedJobs'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ApplicationForm = lazy(() => import('./components/ApplicationForm'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const MyApplicationsModal = lazy(() => import('./components/MyApplicationsModal'));
const PostJobModal = lazy(() => import('./components/PostJobModal'));

import './App.css';
import './styles/week9-pages.css';
import './styles/saas-redesign.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

function App() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isMyAppsOpen, setIsMyAppsOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  const handleOpenApplyModal = useCallback((job = null) => {
    if (!job) return;
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  }, []);

  const handleCloseApplyModal = useCallback(() => {
    setIsApplyModalOpen(false);
    setSelectedJob(null);
  }, []);

  const handleOpenPostJob = useCallback(() => {
    setIsPostJobOpen(true);
  }, []);

  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SavedJobsProvider>
              <ToastProvider>
                <ScrollToTop />
                <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Navbar
                    onOpenMyApplications={() => setIsMyAppsOpen(true)}
                    onOpenPostJob={handleOpenPostJob}
                  />

                  <main className="main-content" id="main-content" style={{ flex: 1 }}>
                    <Suspense fallback={<Loader type="spinner" fullScreen text="Loading view..." />}>
                      <Routes>
                        <Route path="/" element={<Home onApplyJob={handleOpenApplyModal} />} />
                        <Route path="/jobs" element={<Jobs onApplyJob={handleOpenApplyModal} />} />
                        <Route path="/jobs/:id" element={<JobDetailsPage onApplyJob={handleOpenApplyModal} />} />
                        <Route path="/saved-jobs" element={<SavedJobs onApplyJob={handleOpenApplyModal} onOpenPostJob={handleOpenPostJob} />} />
                        <Route path="/contact" element={<Contact />} />

                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard onOpenPostJob={handleOpenPostJob} />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/applications"
                          element={
                            <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                              <Applications onOpenPostJob={handleOpenPostJob} />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile onOpenPostJob={handleOpenPostJob} />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <ProtectedRoute>
                              <Notifications onOpenPostJob={handleOpenPostJob} />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <Settings onOpenPostJob={handleOpenPostJob} />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>

                  <Footer />

                  <Suspense fallback={null}>
                    <ApplicationForm
                      isOpen={isApplyModalOpen}
                      job={selectedJob}
                      onClose={handleCloseApplyModal}
                    />
                    <AuthModal />
                    <MyApplicationsModal
                      isOpen={isMyAppsOpen}
                      onClose={() => setIsMyAppsOpen(false)}
                    />
                    <PostJobModal
                      isOpen={isPostJobOpen}
                      onClose={() => setIsPostJobOpen(false)}
                      onSuccess={() => {
                        setIsPostJobOpen(false);
                        window.dispatchEvent(new CustomEvent('dg:jobs-updated'));
                      }}
                    />
                  </Suspense>

                  <Toast />
                </div>
              </ToastProvider>
            </SavedJobsProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
