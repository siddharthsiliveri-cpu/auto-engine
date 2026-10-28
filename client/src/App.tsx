import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { CartDrawer } from './components/cart/CartDrawer';
import { DeliveryTrackingModal } from './components/cart/DeliveryTrackingModal';
import { AuthPromptModal } from './components/cart/AuthPromptModal';
import CustomCursor from './components/ui/CustomCursor';
import StartupLoader from './components/ui/StartupLoader';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ComponentLibraryPage from './pages/ComponentLibraryPage';
import DatabaseHubPage from './pages/DatabaseHubPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import LoginPage from './pages/LoginPage';
import visitorTracker from './services/visitorTracker';
import { AnimatePresence, motion } from 'framer-motion';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { isTrackingOpen, setIsTrackingOpen, trackingOrderNumber } = useCart();
  // STARTING PAGE: Login Page opens on first launch
  const [activeTab, setActiveTab] = useState<string>('login');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [, setIsLoaded] = useState(false);

  // Track site visits whenever someone opens the app
  useEffect(() => {
    visitorTracker.trackSiteVisit();
  }, []);

  // Enforce role-based tab restrictions:
  // Admin: only projects, components, database (Engineering Hub)
  // Customer: platform, studio, digital-twin, projects, components (Engineering Hub removed)
  useEffect(() => {
    if (activeTab === 'login') return;

    if (user?.role === 'ADMIN') {
      const allowedAdminTabs = ['projects', 'project-detail', 'components', 'admin-orders', 'database'];
      if (!allowedAdminTabs.includes(activeTab)) {
        setActiveTab('projects');
      }
    } else if (user?.role === 'CUSTOMER' || !user) {
      if (activeTab === 'database' || activeTab === 'admin-orders') {
        setActiveTab('home');
      }
    }
  }, [user, activeTab]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('project-detail');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setActiveTab('projects');
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-[#00F0FF]/30 selection:text-white">
      {/* Minimal Startup Loading Screen */}
      <StartupLoader onComplete={() => setIsLoaded(true)} />

      {/* Custom Minimal Desktop Cursor */}
      <CustomCursor />

      {/* Global Floating Navigation Bar */}
      <Navbar
        activeTab={activeTab === 'project-detail' ? 'projects' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Slide-Over Cart Drawer & Checkout */}
      <CartDrawer />

      {/* Client Real-Time Delivery Tracking Modal */}
      <DeliveryTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackingOrderNumber || undefined}
      />

      {/* Guest Authentication Popup Modal */}
      <AuthPromptModal />

      {/* Main Content with Smooth Page Transitions */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoginPage
                onSuccess={(targetTab) => {
                  const defaultTab = user?.role === 'ADMIN' ? 'projects' : 'home';
                  setActiveTab(targetTab || defaultTab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {activeTab === 'home' && user?.role !== 'ADMIN' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage
                onNavigateToTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToComponent={() => setActiveTab('components')}
              />
            </motion.div>
          )}

          {activeTab === 'studio' && user?.role !== 'ADMIN' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ConfiguratorPage
                onNavigateToComponent={() => setActiveTab('components')}
                onNavigateToTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'digital-twin' && user?.role !== 'ADMIN' && (
            <motion.div
              key="digital-twin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DigitalTwinPage />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectsPage
                onSelectProject={handleSelectProject}
                onNavigateToTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'project-detail' && selectedProjectId && (
            <motion.div
              key="project-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectDetailPage
                projectId={selectedProjectId}
                onBack={handleBackToProjects}
                onNavigateToTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'components' && (
            <motion.div
              key="components"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ComponentLibraryPage />
            </motion.div>
          )}

          {/* Admin Client Orders & Deliveries Dashboard */}
          {activeTab === 'admin-orders' && user?.role === 'ADMIN' && (
            <motion.div
              key="admin-orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AdminOrdersPage />
            </motion.div>
          )}

          {/* Database Hub is exclusive to ADMIN and strictly hidden from CUSTOMER */}
          {activeTab === 'database' && user?.role === 'ADMIN' && (
            <motion.div
              key="database"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DatabaseHubPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
