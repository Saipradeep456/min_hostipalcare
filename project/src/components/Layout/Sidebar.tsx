import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, UserCheck, Settings, BarChart3, Clock, Heart, Zap } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { authState } = useAuth();

  const getMenuItems = () => {
    switch (authState.user?.role) {
      case 'patient':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, emoji: '📊', color: 'from-blue-500 to-blue-600' },
          { id: 'book-appointment', label: 'Book Appointment', icon: Calendar, emoji: '📅', color: 'from-green-500 to-green-600' },
          { id: 'my-appointments', label: 'My Appointments', icon: Clock, emoji: '⏰', color: 'from-purple-500 to-purple-600' },
          { id: 'profile', label: 'Profile', icon: Settings, emoji: '⚙️', color: 'from-gray-500 to-gray-600' },
        ];
      case 'doctor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, emoji: '📊', color: 'from-blue-500 to-blue-600' },
          { id: 'my-schedule', label: 'My Schedule', icon: Clock, emoji: '📋', color: 'from-green-500 to-green-600' },
          { id: 'appointments', label: 'Appointments', icon: Calendar, emoji: '📅', color: 'from-purple-500 to-purple-600' },
          { id: 'patients', label: 'Patients', icon: Users, emoji: '👥', color: 'from-orange-500 to-orange-600' },
          { id: 'profile', label: 'Profile', icon: Settings, emoji: '⚙️', color: 'from-gray-500 to-gray-600' },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, emoji: '📊', color: 'from-blue-500 to-blue-600' },
          { id: 'appointments', label: 'All Appointments', icon: Calendar, emoji: '📅', color: 'from-green-500 to-green-600' },
          { id: 'doctors', label: 'Manage Doctors', icon: UserCheck, emoji: '👨‍⚕️', color: 'from-purple-500 to-purple-600' },
          { id: 'patients', label: 'Manage Patients', icon: Users, emoji: '👥', color: 'from-orange-500 to-orange-600' },
          { id: 'settings', label: 'Settings', icon: Settings, emoji: '⚙️', color: 'from-gray-500 to-gray-600' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 min-h-screen"
    >
      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            >
              <Heart className="h-6 w-6" />
            </motion.div>
            <div>
              <p className="font-semibold">
                {authState.user?.firstName} {authState.user?.lastName}
              </p>
              <p className="text-sm opacity-90 capitalize">{authState.user?.role}</p>
            </div>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-3 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ delay: 1, duration: 1 }}
              className="h-full bg-white rounded-full"
            />
          </motion.div>
          <p className="text-xs mt-1 opacity-75">Profile 75% complete</p>
        </div>
      </motion.div>

      {/* Navigation Menu */}
      <nav className="px-4 pb-6">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-lg border border-gray-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`p-2 rounded-lg ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: isActive ? 1 : 0 }}
                    className="text-lg"
                  >
                    {item.emoji}
                  </motion.span>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Quick Stats</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">3 visits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Health Score</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Appointment</span>
              <span className="font-semibold text-blue-600">Tomorrow</span>
            </div>
          </div>
        </motion.div>
      </nav>
    </motion.div>
  );
};

export default Sidebar;