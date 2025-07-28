import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Star, DollarSign, Search, Filter, MapPin, Award, Heart } from 'lucide-react';
import { hybridAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Doctor } from '../../types';
import InteractiveCalendar from '../UI/InteractiveCalendar';
import AnimatedCard from '../UI/AnimatedCard';
import NotificationToast from '../UI/NotificationToast';
import Confetti from 'react-confetti';

const BookAppointment: React.FC = () => {
  const { authState } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>({ show: false, type: 'info', title: '' });

  // Load doctors on component mount
  React.useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const doctorsData = await hybridAPI.getDoctors({ 
        specialization: selectedSpecialization,
        search: searchTerm 
      });
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      showNotification('error', 'Failed to load doctors', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  // Reload doctors when filters change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDoctors();
    }, 500); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpecialization]);

  const specializations = [...new Set(doctors.map(doc => doc.specialization))];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];

  const availableDates = [
    '2024-12-20', '2024-12-21', '2024-12-23', '2024-12-24',
    '2024-12-26', '2024-12-27', '2024-12-30', '2024-12-31'
  ];

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    setNotification({ show: true, type, title, message });
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(2);
    showNotification('info', 'Doctor Selected', `You've selected Dr. ${doctor.firstName} ${doctor.lastName}`);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingStep(3);
    showNotification('info', 'Date Selected', `Appointment date: ${date}`);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep(4);
    showNotification('info', 'Time Selected', `Appointment time: ${time}`);
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason || !authState.user) {
      showNotification('error', 'Missing Information', 'Please fill in all required fields');
      return;
    }

    const bookAppointment = async () => {
      try {
        setLoading(true);
        
        const appointmentData = {
          patientId: authState.user!.id,
          doctorId: selectedDoctor.id,
          appointmentDate: selectedDate,
          startTime: selectedTime,
          endTime: addMinutesToTime(selectedTime, 30), // 30-minute appointments
          reason: reason,
        };

        await hybridAPI.createAppointment(appointmentData);
        
        // Show confetti and success message
        setShowConfetti(true);
        showNotification('success', 'Appointment Booked!', `Your appointment with Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} has been confirmed`);
        
        // Reset form after delay
        setTimeout(() => {
          setShowConfetti(false);
          setSelectedDoctor(null);
          setSelectedDate('');
          setSelectedTime('');
          setReason('');
          setBookingStep(1);
        }, 3000);
        
      } catch (error) {
        console.error('Failed to book appointment:', error);
        showNotification('error', 'Booking Failed', 'Unable to book appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    bookAppointment();
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return date.toTimeString().slice(0, 5);
  };

  const getRating = (doctorId: string) => {
    const ratings = { '1': 4.9, '2': 4.7, '3': 4.8, '4': 4.6 };
    return ratings[doctorId as keyof typeof ratings] || 4.5;
  };

  const getReviewCount = (doctorId: string) => {
    const reviews = { '1': 127, '2': 89, '3': 156, '4': 73 };
    return reviews[doctorId as keyof typeof reviews] || 50;
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
        <p className="text-gray-600">Find the perfect doctor and schedule your visit</p>
        
        {/* Progress Steps */}
        <div className="mt-6 flex items-center space-x-4">
          {[
            { step: 1, label: 'Select Doctor', icon: User },
            { step: 2, label: 'Choose Date', icon: Calendar },
            { step: 3, label: 'Pick Time', icon: Clock },
            { step: 4, label: 'Confirm', icon: Heart }
          ].map(({ step, label, icon: Icon }) => (
            <motion.div
              key={step}
              className="flex items-center space-x-2"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: bookingStep >= step ? 1 : 0.5 }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  bookingStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
                animate={bookingStep === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: bookingStep === step ? Infinity : 0, duration: 2 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              <span className={`text-sm font-medium ${
                bookingStep >= step ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {label}
              </span>
              {step < 4 && <div className="w-8 h-0.5 bg-gray-300" />}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Selection */}
        <div className="lg:col-span-2">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Choose Your Doctor</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </motion.button>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </motion.div>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Doctor List */}
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
                  />
                  <p className="text-gray-600 mt-2">Loading doctors...</p>
                </div>
              )}
              
              <AnimatePresence>
                {!loading && filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 border rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedDoctor?.id === doctor.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center"
                        >
                          <User className="h-8 w-8 text-blue-600" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                          <p className="text-gray-600 text-sm">{doctor.qualifications}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(getRating(doctor.id))
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {getRating(doctor.id)} ({getReviewCount(doctor.id)} reviews)
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Award className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">{doctor.experience} years</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-green-600 font-semibold text-lg">
                          <DollarSign className="h-5 w-5" />
                          <span>{doctor.consultationFee}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">per consultation</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </AnimatedCard>
        </div>

        {/* Appointment Details */}
        <div className="space-y-6">
          {/* Date Selection */}
          <AnimatePresence>
            {bookingStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <InteractiveCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  availableDates={availableDates}
                  bookedDates={['2024-12-19', '2024-12-25']}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Time Selection */}
          <AnimatePresence>
            {bookingStep >= 3 && selectedDate && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {availableTimeSlots.map((time, index) => (
                      <motion.button
                        key={time}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTimeSelect(time)}
                        className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                          selectedTime === time
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <Clock className="h-4 w-4 inline mr-2" />
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reason and Confirmation */}
          <AnimatePresence>
            {bookingStep >= 4 && selectedTime && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason for Visit</h3>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe your symptoms or reason for the visit..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </AnimatedCard>

                {reason && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AnimatedCard className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Appointment Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor:</span>
                          <span className="font-medium">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specialization:</span>
                          <span className="font-medium">{selectedDoctor?.specialization}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3">
                          <span className="text-gray-600">Consultation Fee:</span>
                          <span className="font-semibold text-green-600">${selectedDoctor?.consultationFee}</span>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        onClick={handleBookAppointment}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Booking...' : 'Confirm Appointment'}
                      </motion.button>
                    </AnimatedCard>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;