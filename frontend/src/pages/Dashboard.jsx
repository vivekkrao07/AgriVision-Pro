import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import PredictionResult from '../components/PredictionResult';
import History from '../components/History';
import QuickInsights from '../components/QuickInsights';
import TreatmentPanel from '../components/TreatmentPanel';
import FarmingTips from '../components/FarmingTips';
import { Sprout, LogOut, User, ClipboardList, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const profileRef = useRef(null);
  
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const historyKey = currentUser ? `agrivision_history_${currentUser.username}` : null;

  useEffect(() => {
    if (showProfile && currentUser) {
      const key = `agrivision_saved_plans_${currentUser.username}`;
      const plans = JSON.parse(localStorage.getItem(key) || '[]');
      setSavedPlans(plans);
    }
  }, [showProfile, currentUser]);

  useEffect(() => {
    if (historyKey) {
      const savedHistory = localStorage.getItem(historyKey);
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      } else {
        setHistory([]);
      }
    }
  }, [historyKey]);

  
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handlePredict = async (fileToPredict = selectedFile) => {
    if (!fileToPredict) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const compressedFile = await compressImage(fileToPredict);
    const formData = new FormData();
    formData.append('file', compressedFile);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setResult(data);
      
      if (historyKey) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newHistoryItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            imageUrl: reader.result,
            result: data
          };
          setHistory(prev => {
            const newHistory = [newHistoryItem, ...prev].slice(0, 10);
            localStorage.setItem(historyKey, JSON.stringify(newHistory));
            return newHistory;
          });
        };
        reader.readAsDataURL(fileToPredict);
      }

    } catch (err) {
      console.error("Prediction Error:", err);
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleClearHistory = () => {
    if (historyKey) {
      setHistory([]);
      localStorage.removeItem(historyKey);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewHistoryItem = (item) => {
    setResult(item.result);
    setPreviewUrl(item.imageUrl);
    setSelectedFile(null); // Clear selected file to show history view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReAnalyzeHistoryItem = async (item) => {
    setPreviewUrl(item.imageUrl);
    setResult(null);
    setIsLoading(true);
    
    try {
      // Convert dataURL back to File for prediction
      const res = await fetch(item.imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "reanalysis.jpg", { type: "image/jpeg" });
      handlePredict(file);
    } catch (e) {
      setError("Failed to process image for re-analysis");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="animated-bg" style={{ position: 'fixed', zIndex: -1 }}>
        <div className="gradient-sphere shape-1"></div>
        <div className="gradient-sphere shape-2"></div>
        <div className="gradient-sphere shape-3"></div>
      </div>
      <div className="app-layout">
        <main className="main-content">
          <div className="glass-container relative-container">
            <div className="dashboard-header-actions" ref={profileRef}>
              <div className="user-profile-container">
                <div 
                  className="user-badge" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <User size={16} /> {currentUser?.username}
                </div>
                
                <AnimatePresence>
                  {showProfile && (
                    <motion.div 
                      className="user-profile-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    >
                      <div className="profile-avatar">
                        {currentUser?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="profile-info">
                        <div className="profile-name">{currentUser?.username}</div>
                        <div className="profile-role">Registered Farmer</div>
                      </div>
                      <div className="profile-stats">
                        <div className="stat-col">
                          <div className="stat-num">{history.length}</div>
                          <div className="stat-lbl">Scans</div>
                        </div>
                        <div className="stat-col">
                          <div className="stat-num">{history.filter(i => i.result.prediction.toLowerCase().includes('healthy')).length}</div>
                          <div className="stat-lbl">Healthy</div>
                        </div>
                      </div>

                      <div className="profile-saved-section">
                        <div className="p-section-title"><ClipboardList size={14} /> Saved Plans</div>
                        {savedPlans.length > 0 ? (
                          <div className="p-plans-list">
                            {savedPlans.slice(-3).map((plan, idx) => (
                              <div key={idx} className="p-plan-item">
                                <span className="p-plan-name">{plan.prediction}</span>
                                <span className="p-plan-date">{new Date(plan.timestamp).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-empty">No plans saved yet</div>
                        )}
                        
                        <div className="p-section-title"><Bell size={14} /> Active Reminders</div>
                        {savedPlans.length > 0 ? (
                           <div className="p-plan-item">
                              <span className="p-plan-name">Next Spray: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                           </div>
                        ) : (
                          <div className="p-empty">No reminders set</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sprout size={48} color="#10b981" />
            </div>
            <h1 className="title">AgriVision</h1>
            <p className="subtitle">AI-Powered Wheat Disease Detection</p>
          </motion.div>

          <div className="analysis-container">
            <div className="upload-column">
              <ImageUploader 
                onFileSelect={handleFileSelect} 
                previewUrl={previewUrl} 
                onClearImage={handleClearImage}
              />

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ color: '#ef4444', textAlign: 'center', marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className="btn-primary"
                onClick={() => handlePredict()}
                disabled={!selectedFile || isLoading}
                whileHover={!selectedFile || isLoading ? {} : { scale: 1.02 }}
                whileTap={!selectedFile || isLoading ? {} : { scale: 0.98 }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span className="loader"></span> Analyzing...
                  </div>
                ) : 'Analyze Crop Health'}
              </motion.button>
            </div>
            
            <div className="result-column">
              <AnimatePresence mode="wait">
                {result ? (
                  <PredictionResult result={result} previewUrl={previewUrl} key="result" />
                ) : (
                  <motion.div 
                    className="empty-result-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key="placeholder"
                  >
                    <Sprout size={48} color="rgba(255,255,255,0.1)" />
                    <p>Upload an image and analyze to see results here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <TreatmentPanel result={result} />
        <FarmingTips />
      </main>

      <aside className="sidebar">
        <History 
          history={history} 
          onClearHistory={handleClearHistory} 
          onViewDetails={handleViewHistoryItem}
          onReAnalyze={handleReAnalyzeHistoryItem}
        />
        <QuickInsights history={history} />
      </aside>
    </div>
    </>
  );
}

export default Dashboard;
