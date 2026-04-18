import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, Search, Filter, Play, ExternalLink, ChevronRight } from 'lucide-react';

const History = ({ history, onClearHistory, onViewDetails, onReAnalyze }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'healthy' | 'diseased'
  const [showAll, setShowAll] = useState(false);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.result.prediction.toLowerCase().includes(searchTerm.toLowerCase());
    const isHealthy = item.result.prediction.toLowerCase().includes('healthy');
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'healthy' && isHealthy) || 
      (filter === 'diseased' && !isHealthy);
    return matchesSearch && matchesFilter;
  });

  const displayHistory = showAll ? filteredHistory : filteredHistory.slice(0, 3);

  return (
    <motion.div 
      className="history-container box-reactive"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260 }}
      whileHover={{ 
        boxShadow: "0 25px 50px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.1)",
        borderColor: "rgba(16, 185, 129, 0.2)"
      }}
    >
      <div className="history-header">
        <motion.h3 
          className="history-title"
          whileHover={{ x: 5, color: "#10b981" }}
          style={{ transition: "all 0.2s ease", cursor: 'default' }}
        >
          Recent Scans
        </motion.h3>
        <button className="clear-btn" onClick={onClearHistory}>
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="history-controls">
        <div className="search-bar">
          <Search size={14} />
          <input 
            type="text" 
            placeholder="Search scans..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >All</button>
          <button 
            className={`filter-btn ${filter === 'healthy' ? 'active' : ''}`}
            onClick={() => setFilter('healthy')}
          >Healthy</button>
          <button 
            className={`filter-btn ${filter === 'diseased' ? 'active' : ''}`}
            onClick={() => setFilter('diseased')}
          >Diseased</button>
        </div>
      </div>

      <div className="history-list">
        <AnimatePresence>
          {displayHistory.length > 0 ? (
            displayHistory.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                whileHover={{ 
                  scale: 1.03,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                }}
                className="history-item"
                onClick={() => onViewDetails(item)}
              >
                <div className="history-image-wrapper">
                  <img src={item.imageUrl} alt={item.result.prediction} className="history-image" loading="lazy" />
                  <div className={`severity-indicator ${item.result.prediction.toLowerCase().includes('healthy') ? 'low' : 'high'}`}></div>
                </div>
                <div className="history-details">
                  <div className="history-date">
                    <Clock size={12} /> {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <div className={`history-result ${item.result.prediction.toLowerCase().includes('healthy') ? 'healthy' : 'disease'}`}>
                    {item.result.prediction}
                  </div>
                  <div className="history-confidence">
                    {item.result.confidence.toFixed(1)}% Confidence
                  </div>
                  <div className="history-actions">
                    <button 
                      className="h-action-btn" 
                      title="View Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(item);
                      }}
                    >
                      <ExternalLink size={12} />
                    </button>
                    <button 
                      className="h-action-btn" 
                      title="Re-analyze"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReAnalyze(item);
                      }}
                    >
                      <Play size={12} />
                    </button>
                  </div>
                </div>
                <ChevronRight size={16} className="item-arrow" />
              </motion.div>
            ))
          ) : (
            <div className="empty-history">
              {searchTerm || filter !== 'all' ? 'No matching scans found' : 'No scans yet'}
            </div>
          )}
        </AnimatePresence>
        
        {filteredHistory.length > 3 && (
          <button 
            className="view-all-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All (${filteredHistory.length})`}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default History;
