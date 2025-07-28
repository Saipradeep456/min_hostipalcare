import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, TrendingUp, Bell, Activity, Heart, Zap, Shield, Award } from 'lucide-react';
import AnimatedCard from '../UI/AnimatedCard';

const PatientDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock data
  const upcomingAppointments = [
    {
      id: '1',
      doctor: 'Dr. John Smith',
      specialization: 'Cardiology',
      date: '2024-12-20',
      time: '10:00 AM',
      avatar: '👨‍⚕️',
    },
    {
      id: '2',
      doctor: 'Dr. Sarah Johnson',
      specialization: 'Dermatology',
      date: '2024-12-22',
      time: '2:30 PM',
      avatar: '👩‍⚕️',
    },
  ];

  const recentActivity = [
    { id: '1', action: 'Appointment booked with Dr. Smith', date: '2 days ago', type: 'appointment' },
    { id: '2', action: 'Lab results received', date: '1 week ago', type: 'results' },
    { id: '3', action: 'Prescription refilled', date: '2 weeks ago', type: 'prescription' },
    { id: '4', action: 'Health checkup completed', date: '3 weeks ago', type: 'checkup' },
  ];

  const stats = [
    { 
      label: 'Total Appointments', 
      value: '12', 
      icon: Calendar, 
      color: 'text-blue-600 bg-blue-100',
      trend: '+2 this month',
      trendUp: true
    },
    { 
      label: 'Upcoming', 
      value: '2', 
      icon: Clock, 
      color: 'text-green-600 bg-green-100',
      trend: 'Next: Tomorrow',
      trendUp: true
    },
    { 
      label: 'Completed', 
      value: '8', 
      icon: Activity, 
      color: 'text-purple-600 bg-purple-100',
      trend: '+1 this week',
      trendUp: true
    },
    { 
      label: 'Health Score', 
      value: '92%', 
      icon: Heart, 
      color: 'text-red-600 bg-red-100',
      trend: '+5% improved',
      trendUp: true
    },
  ];

  const healthMetrics = [
    {
      id: 'bp',
      name: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'Normal',
      color: 'green',
      icon: Heart,
      trend: [118, 120, 119, 120, 121, 120],
      lastUpdated: '2 hours ago'
    },
    {
      id: 'hr',
      name: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'Normal',
      color: 'blue',
      icon: Activity,
      trend: [70, 72, 71, 73, 72, 72],
      lastUpdated: '2 hours ago'
    },
    {
      id: 'bmi',
      name: 'BMI',
      value: '23.5',
      unit: '',
      status: 'Normal',
      color: 'purple',
      icon: TrendingUp,
      trend: [23.2, 23.4, 23.3, 23.5, 23.4, 23.5],
      lastUpdated: '1 day ago'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'results':
        return '📋';
      case 'prescription':
        return '💊';
      case 'checkup':
        return '🩺';
      default:
        return '📝';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-gray-600">Here's your health overview and upcoming appointments</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard key={index} delay={index * 0.1} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    className="text-3xl font-bold text-gray-900 mt-1"
                  >
                    {stat.value}
                  </motion.p>
                  <div className={`flex items-center space-x-1 mt-2 text-xs ${
                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 rounded-lg ${stat.color}`}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Appointments */}
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Calendar className="h-5 w-5 text-gray-400" />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="text-2xl"
                  >
                    {appointment.avatar}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{appointment.doctor}</h3>
                    <p className="text-sm text-blue-600 font-medium">{appointment.specialization}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{appointment.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-3 h-3 bg-green-400 rounded-full"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            Book New Appointment
          </motion.button>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <motion.div
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Bell className="h-5 w-5 text-gray-400" />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="text-xl"
                >
                  {getActivityIcon(activity.type)}
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
          >
            View All Activity
          </motion.button>
        </AnimatedCard>
      </div>

      {/* Health Metrics */}
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Health Metrics</h2>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">All Normal</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {healthMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.id;
            
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMetric(isSelected ? null : metric.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      metric.color === 'green' ? 'bg-green-100' :
                      metric.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${
                      metric.color === 'green' ? 'text-green-600' :
                      metric.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 mb-1">{metric.name}</h3>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    className="text-2xl font-bold text-gray-900"
                  >
                    {metric.value}
                    <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                  </motion.div>
                  <div className={`inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    metric.color === 'green' ? 'bg-green-100 text-green-700' :
                    metric.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <Zap className="h-3 w-3" />
                    <span>{metric.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.lastUpdated}</p>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>7-day trend</span>
                        <Award className="h-3 w-3" />
                      </div>
                      <div className="flex items-end space-x-1 h-8">
                        {metric.trend.map((value, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex-1 rounded-t ${
                              metric.color === 'green' ? 'bg-green-300' :
                              metric.color === 'blue' ? 'bg-blue-300' : 'bg-purple-300'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default PatientDashboard;