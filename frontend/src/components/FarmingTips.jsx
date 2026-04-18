import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const FarmingTips = () => {
  const tips = [
    "Early detection reduces yield loss by up to 40%. Inspect crops weekly.",
    "Regularly inspect the underside of crop leaves for early signs of rust.",
    "Balanced fertilization strengthens crop immunity against stripe rust.",
    "Maintain 1-1.5 inches of water per week for optimal wheat growth.",
    "Clear weeds from field borders to reduce pest and disease reservoirs.",
    "Apply nitrogen in split doses to improve wheat protein content and yield.",
    "Rotate wheat with legumes like chickpeas to restore soil nitrogen naturally.",
    "Calibrate your seed drill to ensure uniform depth for better germination.",
    "Harvest at 12-14% moisture to prevent grain spoilage and storage pests.",
    "Clean farm equipment thoroughly after visiting an infected field to prevent spread.",
    "Using resistant wheat varieties is the most cost-effective way to fight rust.",
    "Monitor soil pH (ideally 6.0-7.0) to ensure maximum nutrient availability.",
    "Early morning spraying reduces pesticide drift and improves leaf coverage."
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      className="farming-tips-container box-reactive"
      whileHover={{ 
        scale: 1.02, 
        y: -10,
        boxShadow: "0 25px 50px rgba(0,0,0,0.4), 0 0 20px rgba(52, 211, 153, 0.1)",
        borderColor: "rgba(52, 211, 153, 0.2)"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="tips-header">
        <Lightbulb className="tips-icon" size={18} />
        <h3 className="tips-title">Farming Tips</h3>
      </div>
      
      <div className="tips-content">
        <AnimatePresence mode='wait'>
          <motion.p 
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="tip-text"
          >
            {tips[currentTip]}
          </motion.p>
        </AnimatePresence>
      </div>
 
      <div className="tips-dots">
        {tips.map((_, i) => (
          <motion.div 
            key={i} 
            className={`tip-dot ${i === currentTip ? 'active' : ''}`}
            onClick={() => setCurrentTip(i)}
            whileHover={{ scale: 1.5 }}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FarmingTips;
