import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const Card = ({ className = '', children, ...props }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={cardVariants}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
