import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  hover = true,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;