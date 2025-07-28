import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface InteractiveCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDates?: string[];
  bookedDates?: string[];
}

const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  selectedDate,
  onDateSelect,
  availableDates = [],
  bookedDates = []
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateAvailable = (dateStr: string) => {
    const date = new Date(dateStr);
    return date >= today && !bookedDates.includes(dateStr);
  };

  const getDayStatus = (day: number) => {
    const dateStr = formatDate(day);
    const date = new Date(dateStr);
    
    if (date < today) return 'past';
    if (bookedDates.includes(dateStr)) return 'booked';
    if (availableDates.includes(dateStr)) return 'available';
    if (selectedDate === dateStr) return 'selected';
    return 'default';
  };

  const getDayStyles = (status: string, isHovered: boolean) => {
    const baseStyles = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer";
    
    switch (status) {
      case 'past':
        return `${baseStyles} text-gray-300 cursor-not-allowed`;
      case 'booked':
        return `${baseStyles} bg-red-100 text-red-600 cursor-not-allowed`;
      case 'available':
        return `${baseStyles} bg-green-100 text-green-700 hover:bg-green-200 hover:scale-110 ${isHovered ? 'ring-2 ring-green-300' : ''}`;
      case 'selected':
        return `${baseStyles} bg-blue-600 text-white shadow-lg scale-110`;
      default:
        return `${baseStyles} text-gray-700 hover:bg-gray-100 hover:scale-105 ${isHovered ? 'ring-2 ring-gray-300' : ''}`;
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(day);
      const status = getDayStatus(day);
      const isHovered = hoveredDate === dateStr;
      const isClickable = status !== 'past' && status !== 'booked';

      days.push(
        <motion.div
          key={day}
          whileHover={isClickable ? { scale: 1.1 } : {}}
          whileTap={isClickable ? { scale: 0.95 } : {}}
          className={getDayStyles(status, isHovered)}
          onClick={() => isClickable && onDateSelect(dateStr)}
          onMouseEnter={() => isClickable && setHoveredDate(dateStr)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          {day}
        </motion.div>
      );
    }

    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </motion.button>
        
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </motion.button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveCalendar;