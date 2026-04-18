import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const FarmingTips = () => {
  const tips = [
    "Early detection reduces yield loss by up to 40%. Inspect crops weekly.",
    "Avoid excess irrigation in humid weather to prevent fungal spore germination.",
    "Regularly inspect the underside of crop leaves for early signs of rust.",
    "Balanced fertilization strengthens crop immunity against stripe rust.",
    "Maintain 1-1.5 inches of water per week for optimal wheat growth.",
    "Clear weeds from field borders to reduce pest and disease reservoirs."
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="farming-tips-container">
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
          <div 
            key={i} 
            className={`tip-dot ${i === currentTip ? 'active' : ''}`}
            onClick={() => setCurrentTip(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default FarmingTips;
