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
      className="treatment-panel-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <Beaker className="panel-icon" size={20} />
          <h3 className="panel-title">Recommended Treatment</h3>
        </div>
        <span className="disease-badge">{result.prediction}</span>
      </div>

      <div className="panel-content">
        <ul className="treatment-list">
          {steps.map((step, index) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="treatment-step"
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
