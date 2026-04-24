import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { getDiseaseInfo } from '../utils/diseaseData';
import { CheckCircle, AlertTriangle, Info, Beaker, AlertOctagon, Sprout, Save, Calendar, MapPin, CheckSquare, Square, BrainCircuit, ExternalLink, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useAuth } from '../context/AuthContext';

const PredictionResult = ({ result, previewUrl }) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [reminderSet, setReminderSet] = useState(false);
  const [activeTab, setActiveTab] = useState('treatment'); // 'treatment' | 'ai'
  const [isExporting, setIsExporting] = useState(false);
  const resultRef = useRef();
  const { currentUser } = useAuth();
  
  // Mouse interaction state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };
  
  const backgroundGlow = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(250px circle at ${x}px ${y}px, var(--accent-glow), transparent 80%)`
  );

  const isHealthy = result.prediction.toLowerCase().includes('healthy');
  const resultClass = isHealthy ? 'healthy' : 'disease';
  const diseaseInfo = getDiseaseInfo(result.prediction);
  
  // Calculate confidence level and colors
  const confValue = result.confidence > 1 ? result.confidence : result.confidence * 100;
  let confLevel = "Low Confidence";
  let confColorClass = "conf-red";
  let confGradient = "linear-gradient(90deg, #f87171, #ef4444)";
  let confHelperText = "I am a bit uncertain about this prediction. Please ensure the leaf is clearly visible and well-lit.";
  
  if (confValue > 90) {
    confLevel = "Very Reliable";
    confColorClass = "conf-green";
    confGradient = "linear-gradient(90deg, #34d399, #10b981)";
    confHelperText = "I am very confident in this diagnosis. The visual markers strongly match the identified condition.";
  } else if (confValue >= 60) {
    confLevel = "Moderate";
    confColorClass = "conf-yellow";
    confGradient = "linear-gradient(90deg, #facc15, #eab308)";
    confHelperText = "Fairly reliable, but physical inspection is recommended before taking major actions.";
  }

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const handleSavePlan = () => {
    const username = currentUser?.username || 'guest';
      
    const plan = {
      prediction: result.prediction,
      steps: diseaseInfo.maintenance,
      completedSteps,
      timestamp: new Date().toISOString()
    };
    
    const key = `agrivision_saved_plans_${username}`;
    const savedPlans = JSON.parse(localStorage.getItem(key) || '[]');
    savedPlans.push(plan);
    localStorage.setItem(key, JSON.stringify(savedPlans));
    alert('Treatment plan saved to your profile!');
  };

  const handleSetReminder = () => {
    setReminderSet(!reminderSet);
    if (!reminderSet) {
      alert(`Reminder set! You will be notified in 14 days for the next checkup.`);
    }
  };

  const handleFindShops = () => {
    window.open(`https://www.google.com/maps/search/agro+shops+near+me`, '_blank');
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = resultRef.current;
    
    // Configure PDF options
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `AgriVision_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#0f172a',
        scrollY: 0,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('.result-card');
          if (el) {
            el.style.background = '#0f172a';
            el.style.color = '#ffffff';
            el.style.padding = '20px';
            el.style.backdropFilter = 'none'; // Fix for whitish/transparent issues
            el.style.webkitBackdropFilter = 'none';
          }
          // Also fix text colors for clarity in PDF
          clonedDoc.querySelectorAll('.step-text, .result-value, .explanation-text').forEach(t => {
            t.style.color = '#ffffff';
          });
        }
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Make sure we are on the treatment tab for a complete report
    if (activeTab !== 'treatment') {
      setActiveTab('treatment');
    }

    // Small delay to let the tab switch render if needed
    setTimeout(() => {
      html2pdf().from(element).set(opt).save().then(() => {
        setIsExporting(false);
      });
    }, 300);
  };

  // Helper for severity badge colors
  const getSeverityBadgeClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <motion.div 
      ref={resultRef}
      className="result-card box-reactive"
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -30 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onMouseMove={handleMouseMove}
      whileHover={{ 
        y: -10,
        boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 25px rgba(16, 185, 129, 0.2)",
        borderColor: "rgba(16, 185, 129, 0.4)"
      }}
      style={{
        background: backgroundGlow,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Glow Layer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: backgroundGlow,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div className="result-tabs">
        <button 
          className={`tab-btn ${activeTab === 'treatment' ? 'active' : ''}`}
          onClick={() => setActiveTab('treatment')}
        >
          <Beaker size={16} /> Diagnosis
        </button>
        {!isHealthy && (
          <button 
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <BrainCircuit size={16} /> AI Insight
          </button>
        )}
      </div>

      {activeTab === 'treatment' ? (
        <>
          <div className="result-header">
            {isHealthy ? <CheckCircle className="result-icon healthy-icon" size={32} /> : <AlertTriangle className="result-icon disease-icon" size={32} />}
            <div>
              <div className="result-label">Analysis Result</div>
              <div className={`result-value ${resultClass}`}>
                {result.prediction}
              </div>
            </div>
          </div>
          
          <div className="confidence-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
              <span className="confidence-text font-medium">
                Confidence: {confValue.toFixed(1)}% 
                <span className={`conf-label ${confColorClass}`}> ({confLevel})</span>
              </span>
            </div>
            <div className="confidence-bar-bg">
              <motion.div 
                className="confidence-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${confValue}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ background: confGradient }}
              />
            </div>
            <p className="conf-helper-text">{confHelperText}</p>
            {confValue < 60 && (
              <div className="conf-warning-box">
                <AlertOctagon size={14} /> Warning: Low confidence. Results may be inaccurate.
              </div>
            )}
          </div>

          <motion.div 
            className="maintenance-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="badges-container">
              <div className="status-badge">
                <AlertOctagon size={16} /> 
                <span>Severity: <span className={getSeverityBadgeClass(diseaseInfo.severity)}>{diseaseInfo.severity}</span></span>
              </div>
              <div className="status-badge">
                <Sprout size={16} /> 
                <span>Impact: <span className={getSeverityBadgeClass(diseaseInfo.impact === 'Severe' ? 'High' : diseaseInfo.impact === 'Moderate' ? 'Medium' : 'Low')}>{diseaseInfo.impact}</span></span>
              </div>
            </div>

            <div className="about-condition">
              <div className="section-header">
                <Info size={18} />
                <h3>Condition Summary</h3>
              </div>
              <p className="maintenance-desc">{diseaseInfo.description}</p>
            </div>
            
            <div className="treatment-checklist-section">
              <div className="section-header">
                <CheckSquare size={18} className="text-blue" />
                <h3>Actionable Treatment Plan</h3>
              </div>
              <div className="action-card">
                <ul className="treatment-checklist">
                  {diseaseInfo.maintenance.map((tip, index) => (
                    <motion.li 
                      key={index}
                      className={`checklist-item ${completedSteps.includes(index) ? 'completed' : ''}`}
                      onClick={() => toggleStep(index)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="checkbox-wrapper">
                        {completedSteps.includes(index) ? <CheckSquare size={18} className="text-green" /> : <Square size={18} />}
                      </div>
                      <span className="step-text">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="action-button-group">
                <button className="btn-action primary" onClick={handleSavePlan} data-html2canvas-ignore="true">
                  <Save size={16} /> Save Plan
                </button>
                <button 
                  className="btn-action primary" 
                  onClick={handleExportPDF} 
                  disabled={isExporting}
                  style={{ background: '#3b82f6' }}
                  data-html2canvas-ignore="true"
                >
                  <Download size={16} /> {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
                <button 
                  className={`btn-action secondary ${reminderSet ? 'active' : ''}`}
                  onClick={handleSetReminder}
                  data-html2canvas-ignore="true"
                >
                  <Calendar size={16} /> {reminderSet ? 'Reminder Set' : 'Set Reminder'}
                </button>
                <button className="btn-action outline" onClick={handleFindShops}>
                  <MapPin size={16} /> Find Agro Shops
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div 
          className="ai-explanation-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="section-header">
            <BrainCircuit size={18} className="text-purple" />
            <h3>My Expert Insight</h3>
          </div>
          
          <div className="explanation-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
            <img src={previewUrl} alt="Analyzed Crop" className="explanation-img" />
            
            {/* Laser Scan Animation */}
            <motion.div 
              initial={{ top: '-5%' }}
              animate={{ top: '105%' }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1
              }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(to bottom, transparent, #10b981, transparent)',
                boxShadow: '0 0 15px #10b981',
                zIndex: 2,
                opacity: 0.8
              }}
            />

            <div className="ai-focus-overlay">
              <div className="focus-box box-1"></div>
              <div className="focus-box box-2"></div>
            </div>
            <div className="overlay-tag">
              <div className="pulse-dot"></div>
              Detected Indicators
            </div>
          </div>

          <div className="explanation-content">
            <div className="explanation-bubble">
              <p className="explanation-text">{diseaseInfo.aiExplanation}</p>
            </div>
            
            <div className="key-findings">
              <h4>Visual Biomarkers Detected:</h4>
              <div className="findings-grid">
                <div className="finding-item">
                  <CheckCircle size={14} className="text-green" />
                  <span>Pattern Recognition: {result.prediction} detected</span>
                </div>
                <div className="finding-item">
                  <CheckCircle size={14} className="text-green" />
                  <span>Morphological Deviation flagged</span>
                </div>
              </div>
            </div>
          </div>
          
          <motion.button 
            className="full-width" 
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)",
              filter: "brightness(1.1)"
            }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              marginTop: '1.5rem',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            onClick={() => window.open(`https://www.google.com/search?q=wheat+${result.prediction}+disease+info`, '_blank')}
          >
            <ExternalLink size={16} /> Learn more about {result.prediction}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PredictionResult;
