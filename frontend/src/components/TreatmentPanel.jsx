import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, Save, Play } from 'lucide-react';
import { getDiseaseInfo } from '../utils/diseaseData';

const TreatmentPanel = ({ result }) => {
  if (!result) return null;

  const diseaseInfo = getDiseaseInfo(result.prediction);
  const steps = diseaseInfo.maintenance || [];

  return (
    <motion.div 
      className="treatment-panel-card box-reactive"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ 
        y: -10,
        boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.2)",
        borderColor: "rgba(16, 185, 129, 0.4)"
      }}
    >
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <Beaker className="panel-icon" size={20} />
          <h3 className="panel-title">Recommended Treatment</h3>
        </div>
        <motion.span 
          className="disease-badge"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {result.prediction}
        </motion.span>
      </div>
 
      <div className="panel-content">
        <ul className="treatment-list">
          {steps.map((step, index) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, type: "spring" }}
              whileHover={{ 
                x: 10,
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                color: "#34d399",
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
              className="treatment-step"
              style={{ cursor: 'pointer', borderRadius: '12px', padding: '12px', transition: 'all 0.3s ease', marginBottom: '8px' }}
            >
              <div className="step-dot"></div>
              <span>{step}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default TreatmentPanel;
