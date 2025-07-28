import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, User, LogOut, Stethoscope, Bell, Settings, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'Appointment reminder: Dr. Smith tomorrow at 10:00 AM', time: '5m ago', unread: true },
    { id: 2, message: 'Lab results are ready for review', time: '1h ago', unread: true },
    { id: 3, message: 'Prescription refill approved', time: '2h ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MediCare Hospital</h1>
              <p className="text-xs text-gray-500">Your Health, Our Priority</p>
            </div>
          </motion.div>
          
          {authState.user && (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>
              </motion.div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700">
                      {authState.user.firstName} {authState.user.lastName}
                    </p>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {authState.user.role}
                    </motion.span>
                  </div>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <motion.button
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>My Calendar</span>
                      </motion.button>
                      <div className="border-t border-gray-200 my-1" />
                      <motion.button
                        whileHover={{ backgroundColor: '#fef2f2' }}
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;