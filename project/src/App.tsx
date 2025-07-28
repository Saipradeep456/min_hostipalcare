import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import BookAppointment from './components/Patient/BookAppointment';
import MyAppointments from './components/Patient/MyAppointments';
import LoadingSpinner from './components/UI/LoadingSpinner';

const AppContent: React.FC = () => {
  const { authState } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 2, ease: "linear" },
              scale: { repeat: Infinity, duration: 1.5 }
            }}
            className="mb-6"
          >
            <LoadingSpinner size="lg" />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-gray-600 font-medium"
          >
            Loading your health dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!authState.user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    const contentVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    };

    switch (activeView) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PatientDashboard />
          </motion.div>
        );
      case 'book-appointment':
        return (
          <motion.div
            key="book-appointment"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <BookAppointment />
          </motion.div>
        );
      case 'my-appointments':
        return (
          <motion.div
            key="my-appointments"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <MyAppointments />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div
            key="profile"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                    >
                      <span className="text-2xl text-white font-bold">
                        {authState.user.firstName[0]}{authState.user.lastName[0]}
                      </span>
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {authState.user.firstName} {authState.user.lastName}
                      </h2>
                      <p className="text-gray-600 capitalize">{authState.user.role}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{authState.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{authState.user.phone}</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Profile
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="dashboard"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PatientDashboard />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;