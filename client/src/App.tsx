import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
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
import LoginPage from './pages/LoginPage';
import { AnimatePresence, motion } from 'framer-motion';

export const App: React.FC = () => {
  // STARTING PAGE: Login Page opens on first launch
  const [activeTab, setActiveTab] = useState<string>('login');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('project-detail');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setActiveTab('projects');
  };

  return (
    <AuthProvider>
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
                    setActiveTab(targetTab || 'home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'home' && (
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

            {activeTab === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ConfiguratorPage
                  onNavigateToComponent={() => setActiveTab('components')}
                />
              </motion.div>
            )}

            {activeTab === 'digital-twin' && (
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

            {activeTab === 'database' && (
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
    </AuthProvider>
  );
};

export default App;
