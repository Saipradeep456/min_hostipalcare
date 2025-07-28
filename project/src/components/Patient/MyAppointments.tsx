import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, Star, MessageCircle, Video, MapPin } from 'lucide-react';
import { hybridAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types';
import AnimatedCard from '../UI/AnimatedCard';
import NotificationToast from '../UI/NotificationToast';

const MyAppointments: React.FC = () => {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>({ show: false, type: 'info', title: '' });

  // Load appointments on component mount
  React.useEffect(() => {
    if (authState.user) {
      loadAppointments();
    }
  }, [authState.user, activeTab]);

  const loadAppointments = async () => {
    if (!authState.user) return;
    
    setLoading(true);
    try {
      const appointmentsData = await hybridAPI.getAppointments(
        authState.user.id,
        authState.user.role,
        { status: getStatusFilter(activeTab) }
      );
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      showNotification('error', 'Failed to load appointments', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const getStatusFilter = (tab: string) => {
    switch (tab) {
      case 'upcoming':
        return undefined; // Will filter on frontend
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return undefined;
    }
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    setNotification({ show: true, type, title, message });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterAppointments = (status: string) => {
    switch (status) {
      case 'upcoming':
        return appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending');
      case 'completed':
        return appointments.filter(apt => apt.status === 'completed');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled');
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments(activeTab);

  const handleCancelAppointment = (appointmentId: string) => {
    const cancelAppointment = async () => {
      try {
        setLoading(true);
        // In a real implementation, you'd show a confirmation dialog first
        await hybridAPI.updateAppointment(appointmentId, { status: 'cancelled' });
        showNotification('success', 'Appointment Cancelled', 'Your appointment has been cancelled successfully');
        loadAppointments(); // Reload appointments
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
        showNotification('error', 'Cancellation Failed', 'Unable to cancel appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // In a real app, you'd show a confirmation dialog here
    cancelAppointment();
  };

  const handleReschedule = (appointmentId: string) => {
    showNotification('info', 'Reschedule', 'Redirecting to booking page...');
  };

  const handleJoinVideo = (appointmentId: string) => {
    showNotification('success', 'Video Call', 'Joining video consultation...');
  };

  const handleRateDoctor = (appointmentId: string) => {
    showNotification('info', 'Rate Doctor', 'Opening rating form...');
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <NotificationToast
        {...notification}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your healthcare appointments and history</p>
      </motion.div>

      {/* Interactive Tabs */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <nav className="flex space-x-2">
            {[
              { key: 'upcoming', label: 'Upcoming', count: filterAppointments('upcoming').length, emoji: '⏰' },
              { key: 'completed', label: 'Completed', count: filterAppointments('completed').length, emoji: '✅' },
              { key: 'cancelled', label: 'Cancelled', count: filterAppointments('cancelled').length, emoji: '❌' },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all relative ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.key
                          ? 'bg-white text-blue-600'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tab.count}
                    </motion.span>
                  )}
                </div>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
            />
            <p className="text-gray-600 mt-2">Loading appointments...</p>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {!loading && filteredAppointments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { repeat: Infinity, duration: 2 },
                  scale: { repeat: Infinity, duration: 3 }
                }}
                className="text-6xl mb-4"
              >
                📅
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments. Book one now!"
                  : `No ${activeTab} appointments to display.`
                }
              </p>
              {activeTab === 'upcoming' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Your First Appointment
                </motion.button>
              )}
            </motion.div>
          ) : (
            !loading && <motion.div
              key="appointments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <AnimatedCard 
                    className="p-6 overflow-hidden"
                    onClick={() => setSelectedAppointment(
                      selectedAppointment === appointment.id ? null : appointment.id
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center"
                        >
                          <User className="h-8 w-8 text-blue-600" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                            </h3>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.status}
                            </motion.span>
                          </div>
                          <p className="text-blue-600 font-medium mb-1">{appointment.doctor?.specialization}</p>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{appointment.reason}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center space-x-1"
                            >
                              <Calendar className="h-4 w-4" />
                              <span>{appointment.appointmentDate}</span>
                            </motion.div>
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center space-x-1"
                            >
                              <Clock className="h-4 w-4" />
                              <span>{appointment.startTime} - {appointment.endTime}</span>
                            </motion.div>
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center space-x-1"
                            >
                              <Phone className="h-4 w-4" />
                              <span>{appointment.doctor?.phone}</span>
                            </motion.div>
                          </div>

                          {appointment.notes && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100"
                            >
                              <p className="text-sm text-gray-700">
                                <strong>Doctor's Notes:</strong> {appointment.notes}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center"
                        >
                          {getStatusIcon(appointment.status)}
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    <AnimatePresence>
                      {selectedAppointment === appointment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t border-gray-200"
                        >
                          <div className="flex flex-wrap gap-3">
                            {appointment.status === 'confirmed' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoinVideo(appointment.id);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Video className="h-4 w-4" />
                                  <span>Join Video Call</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReschedule(appointment.id);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Calendar className="h-4 w-4" />
                                  <span>Reschedule</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelAppointment(appointment.id);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span>Cancel</span>
                                </motion.button>
                              </>
                            )}
                            
                            {appointment.status === 'completed' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRateDoctor(appointment.id);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                  <Star className="h-4 w-4" />
                                  <span>Rate Doctor</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span>Leave Review</span>
                                </motion.button>
                              </>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <MapPin className="h-4 w-4" />
                              <span>Get Directions</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyAppointments;