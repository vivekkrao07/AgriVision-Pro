import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Target, ShieldAlert, BarChart3 } from 'lucide-react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const QuickInsights = ({ history }) => {
  const totalScans = history.length;
  const healthyCount = history.filter(item => item.result.prediction.toLowerCase().includes('healthy')).length;
  const diseasedScans = history.filter(item => !item.result.prediction.toLowerCase().includes('healthy')).length;
  const successRate = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 0;
  
  // Calculate health trend
  const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const latestScans = sortedHistory.slice(-5);
  
  let trend = 'Stable';
  let trendIcon = <Minus size={14} />;
  let trendClass = 'trend-stable';

  if (latestScans.length >= 2) {
    const prevHealthy = latestScans[latestScans.length - 2].result.prediction.toLowerCase().includes('healthy');
    const currHealthy = latestScans[latestScans.length - 1].result.prediction.toLowerCase().includes('healthy');
    
    if (!prevHealthy && currHealthy) {
        trend = 'Improving';
        trendIcon = <TrendingUp size={14} />;
        trendClass = 'trend-up';
    } else if (prevHealthy && !currHealthy) {
        trend = 'Worsening';
        trendIcon = <TrendingDown size={14} />;
        trendClass = 'trend-down';
    }
  }

  // Simple SVG Chart Data
  const chartPoints = latestScans.map((item, index) => {
    const x = (index / (latestScans.length - 1 || 1)) * 100;
    const isHealthy = item.result.prediction.toLowerCase().includes('healthy');
    // Health score: High if healthy+confident, Low if diseased+confident
    const healthScore = isHealthy ? item.result.confidence : (100 - item.result.confidence);
    const y = 100 - healthScore; 
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = latestScans.length > 1 
    ? `0,100 ${chartPoints} 100,100` 
    : '';

  return (
    <motion.div 
      className="insights-container box-reactive"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 260 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 25px 50px rgba(0,0,0,0.4), 0 0 20px rgba(56, 189, 248, 0.1)",
        borderColor: "rgba(56, 189, 248, 0.3)"
      }}
    >
      <div className="insights-header">
        <h3 className="insights-title">Performance Analytics</h3>
        <BarChart3 size={18} className="text-secondary" />
      </div>

      <div className="insights-grid">
        <motion.div 
          className="insight-card" 
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            backgroundColor: "rgba(255,255,255,0.05)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
          }} 
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="insight-value">{totalScans}</span>
          <span className="insight-label">Total Scans</span>
        </motion.div>
        
        <motion.div 
          className="insight-card insight-success" 
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.15)"
          }} 
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="insight-stat">
            <Target size={14} />
            <span className="insight-value">{successRate}%</span>
          </div>
          <span className="insight-label">Healthy Rate</span>
        </motion.div>
        
        <motion.div 
          className="insight-card insight-disease" 
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            boxShadow: "0 10px 25px rgba(239, 68, 68, 0.15)"
          }} 
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="insight-value">{diseasedScans}</div>
          <div className="insight-label">Diseased</div>
          <div className={`insight-stat ${trendClass}`}>
            {trendIcon} {trend}
          </div>
        </motion.div>
      </div>

      <div className="health-tracking-chart">
         <div className="chart-header">
            <Activity size={14} />
            <span>Health Confidence Trend</span>
         </div>
         {latestScans.length > 1 ? (
           <div className="svg-container">
              <svg viewBox="0 0 100 100" className="health-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                <polygon points={areaPoints} fill="url(#chartGradient)" />
                <path 
                  d={`M ${chartPoints}`} 
                  fill="none" 
                  stroke="var(--accent-color)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {latestScans.map((item, index) => {
                   const x = (index / (latestScans.length - 1 || 1)) * 100;
                   const isHealthy = item.result.prediction.toLowerCase().includes('healthy');
                   const healthScore = isHealthy ? item.result.confidence : (100 - item.result.confidence);
                   const y = 100 - healthScore;
                   return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="3" fill="var(--accent-color)" />
                      <circle cx={x} cy={y} r="6" fill="var(--accent-color)" fillOpacity="0.2" />
                    </g>
                   );
                })}
              </svg>
              <div className="chart-labels">
                 <span>{new Date(latestScans[0].timestamp).toLocaleDateString()}</span>
                 <span>Today</span>
              </div>
           </div>
         ) : (
           <div className="chart-placeholder">Need more scans to show trend</div>
         )}
      </div>

      <div className="risk-assessment-footer">
         <ShieldAlert size={14} className={successRate < 50 ? 'text-red' : 'text-green'} />
         <span>Field Status: <strong>{successRate > 80 ? 'Optimal' : successRate > 50 ? 'At Risk' : 'Critical'}</strong></span>
      </div>
    </motion.div>
  );
};

export default QuickInsights;
